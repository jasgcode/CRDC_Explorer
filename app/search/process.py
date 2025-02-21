import numpy as np
import pandas as pd
import os
import faiss
import aiohttp
import aiofiles
import asyncio
import shutil
import gc
from datetime import datetime   
import glob
import json
from query import query_all_projects, query_patients_by_project, query_gdc

MIN_PATIENTS = 20
SAVE_FREQUENCY = 2500
# Global FAISS index variables and a lock for safe updates.
faiss_index = None
caseid_to_index = {}  # Maps case_id to index position in FAISS
index_lock = asyncio.Lock()
reference_genes = None
def process_file_in_chunks(filepath, chunk_size=10000):
    """
    Process a large gene counts TSV file in chunks.
    Returns a DataFrame of processed gene counts.
    """
    try:
        chunks = []
        processed_rows = 0

        # Count total rows (subtract 2 for headers)
        with open(filepath) as f:
            total_rows = sum(1 for _ in f) - 2

        print(f"Processing {filepath}")
        print(f"Total rows to process: {total_rows:,}")

        special_rows = ['N_unmapped', 'N_multimapping', 'N_noFeature', 'N_ambiguous']

        for chunk_num, chunk in enumerate(
            pd.read_csv(filepath, sep='\t', header=1, chunksize=chunk_size)
        ):
            try:
                chunk = chunk.set_index(chunk.columns[0])
                if 'unstranded' not in chunk.columns:
                    raise ValueError(f"No 'unstranded' column found in chunk {chunk_num}")

                processed_chunk = (
                    chunk[['unstranded']]
                    .loc[~chunk.index.isin(special_rows)]
                    .apply(pd.to_numeric, errors='coerce')
                    .dropna()
                    .loc[lambda x: x['unstranded'] != 0]
                )
                if not processed_chunk.empty:
                    chunks.append(processed_chunk)

                processed_rows += len(chunk)
                progress = (processed_rows / total_rows) * 100
                print(f"\rProgress: {progress:.1f}% ({processed_rows:,}/{total_rows:,} rows)", end="")
            except Exception as e:
                print(f"\nError processing chunk {chunk_num}: {e}")
                continue

        print("\nCombining chunks...")
        final_df = pd.concat(chunks) if chunks else pd.DataFrame()
        gc.collect()
        chunks.clear()
        gc.collect()
        print(f"Final dataset shape: {final_df.shape}")
        return final_df

    except Exception as e:
        print(f"Failed to process file {filepath}: {e}")
        return None


def compute_embedding(processed_data, reference_genes=None):
    """
    Compute an embedding vector from the processed data.
    Here we simply convert the 'unstranded' column values to a float32 numpy array.
    """
    try:
        if reference_genes is not None:
            # Align to reference, filling missing genes with 0.
            processed_data = processed_data.reindex(reference_genes, fill_value=0)
        return processed_data['unstranded'].values.astype("float32")
    except Exception as e:
        print(f"Error computing embedding: {e}")
        return None


last_save_count = 0

async def add_embedding(case_id, embedding):
    """
    Add the computed embedding to the global FAISS index in a thread-safe manner.
    Save progress every SAVE_FREQUENCY entries.
    """
    global faiss_index, caseid_to_index, last_save_count
    async with index_lock:
        if faiss_index is None:
            d = len(embedding)
            faiss_index = faiss.IndexFlatL2(d)
            print(f"Initialized FAISS index with dimension {d}")
        
        faiss_index.add(np.expand_dims(embedding, axis=0))
        current_idx = faiss_index.ntotal - 1
        caseid_to_index[case_id] = current_idx
        print(f"Added embedding for case {case_id} at index {current_idx}")

        # Check if we need to save progress
        if current_idx - last_save_count >= SAVE_FREQUENCY:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            index_path = f"faiss_index_{timestamp}.bin"
            mapping_path = f"case_mapping_{timestamp}.json"
            
            # Save the current state
            save_faiss_index(index_path, mapping_path)
            last_save_count = current_idx
            
            # Cleanup old saves (keep last 3)
            cleanup_old_saves()

def cleanup_old_saves(keep_last=3):
    """Clean up old save files, keeping only the most recent ones."""
    import glob
    
    # List all save files
    index_files = sorted(glob.glob("faiss_index_*.bin"))
    mapping_files = sorted(glob.glob("case_mapping_*.json"))
    
    # Remove old files, keeping the specified number of recent files
    for files in [index_files, mapping_files]:
        if len(files) > keep_last:
            for old_file in files[:-keep_last]:
                try:
                    os.remove(old_file)
                    print(f"Cleaned up old save file: {old_file}")
                except Exception as e:
                    print(f"Error cleaning up {old_file}: {e}")

def save_faiss_index(index_path="faiss_index.bin", mapping_path="case_mapping.json"):
    """Save the FAISS index and case ID mapping to disk"""
    if faiss_index is not None:
        try:
            faiss.write_index(faiss_index, index_path)
            with open(mapping_path, 'w') as f:
                json.dump(caseid_to_index, f)
            print(f"Saved index with {faiss_index.ntotal} vectors to {index_path}")
            # Force garbage collection after saving
            gc.collect()
        except Exception as e:
            print(f"Error saving index: {e}")

async def download_and_process_file(session, file_meta, base_dir="downloads"):
    """
    Download the file, process it, compute its embedding, and add it to the FAISS index.
    """
    patient_dir = os.path.join(base_dir, file_meta["case_id"])
    os.makedirs(patient_dir, exist_ok=True)
    filepath = os.path.join(patient_dir, file_meta["file_name"])

    url = f'https://api.gdc.cancer.gov/data/{file_meta["file_id"]}'
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=300)) as resp:
        if resp.status == 200:
            async with aiofiles.open(filepath, "wb") as f:
                while chunk := await resp.content.read(8192):
                    await f.write(chunk)
            print(f"Downloaded: {filepath}")
        else:
            print(f"Failed to download {file_meta['file_id']}: {resp.status}")
            return None

    # Offload the synchronous file processing to a thread.
    processed_data = await asyncio.to_thread(process_file_in_chunks, filepath)
    if processed_data is None or processed_data.empty:
        print(f"Processing failed for {filepath}")
        return None

        global reference_genes
    if reference_genes is None:
        # Initialize reference_genes from the first file processed.
        reference_genes = processed_data.index
    embedding = compute_embedding(processed_data, reference_genes)
    if embedding is None:
        print(f"Embedding computation failed for {filepath}")
        return processed_data
    await add_embedding(file_meta["case_id"], embedding)
    if os.path.exists(patient_dir):
            shutil.rmtree(patient_dir)
            print(f"Cleaned up directory for case {file_meta['case_id']}")
            gc.collect()  
    return processed_data


async def process_patient(patient_id, session, base_dir="downloads"):
    """
    For a given patient, download and process their STAR count TSV.
    """
    file_df = await query_gdc(patient_id)
    await asyncio.sleep(0.8)  # Simulate processing time
    if file_df is None or file_df.empty:
        print(f"No file metadata for patient {patient_id}")
        return None
    file_meta = file_df.to_dict("records")[0]
    return await download_and_process_file(session, file_meta, base_dir)

def load_most_recent_save():
    """Load the most recent FAISS index and mapping files."""
    import glob
    from datetime import datetime
    
    try:
        # Find all save files
        index_files = sorted(glob.glob("faiss_index_*.bin"))
        mapping_files = sorted(glob.glob("case_mapping_*.json"))
        
        if not index_files or not mapping_files:
            print("No save files found.")
            return False
            
        # Extract timestamps and pair files
        file_pairs = []
        for idx_file in index_files:
            # Extract timestamp from index filename (format: faiss_index_YYYYMMDD_HHMMSS.bin)
            idx_timestamp = idx_file.split('_')[2:4][0]
            # Find matching mapping file
            matching_map = next(
                (f for f in mapping_files if idx_timestamp in f), 
                None
            )
            if matching_map:
                file_pairs.append((idx_file, matching_map, idx_timestamp))
        
        if not file_pairs:
            print("No matching index-mapping file pairs found.")
            return False
            
        # Sort by timestamp and get most recent pair
        latest_pair = sorted(file_pairs, key=lambda x: x[2])[-1]
        latest_index, latest_mapping = latest_pair[0:2]
        
        # Load the files
        global faiss_index, caseid_to_index, last_save_count
        print(f"Loading index from {latest_index}...")
        faiss_index = faiss.read_index(latest_index)
        
        print(f"Loading mapping from {latest_mapping}...")
        with open(latest_mapping, 'r') as f:
            caseid_to_index = json.load(f)
            
        last_save_count = faiss_index.ntotal
        print(f"Successfully loaded index with {faiss_index.ntotal} vectors")
        return True
        
    except Exception as e:
        print(f"Error loading save files: {str(e)}")
        # Reset globals in case of partial load
        faiss_index = None
        caseid_to_index = {}
        last_save_count = 0
        return False
    
def aggregate_checkpoints(checkpoint_dir="."):
    """Aggregate all checkpoint FAISS indexes into a single index."""
    import glob
    from datetime import datetime
    
    try:
        # Find all checkpoint files
        index_files = sorted(glob.glob(os.path.join(checkpoint_dir, "faiss_index_*.bin")))
        mapping_files = sorted(glob.glob(os.path.join(checkpoint_dir, "case_mapping_*.json")))
        
        if not index_files:
            print("No checkpoint files found.")
            return None, None
            
        # Load the first index to get dimensions
        base_index = faiss.read_index(index_files[0])
        dimension = base_index.d
        
        # Create a new index with same parameters
        combined_index = faiss.IndexFlatL2(dimension)
        combined_mapping = {}
        
        print(f"Found {len(index_files)} checkpoints to aggregate")
        
        # Process each checkpoint
        for idx_file, map_file in zip(index_files, mapping_files):
            try:
                print(f"Processing {idx_file}...")
                
                # Load checkpoint index
                checkpoint_index = faiss.read_index(idx_file)
                
                # Load checkpoint mapping
                with open(map_file, 'r') as f:
                    checkpoint_mapping = json.load(f)
                
                # Get current total before adding vectors
                current_total = combined_index.ntotal
                
                # Add vectors from checkpoint
                vectors = faiss.vector_float_to_array(checkpoint_index.get_xb())
                vectors = vectors.reshape(checkpoint_index.ntotal, checkpoint_index.d)
                combined_index.add(vectors)
                
                # Update mapping with offset
                for case_id, idx in checkpoint_mapping.items():
                    if case_id not in combined_mapping:
                        combined_mapping[case_id] = idx + current_total
                
                print(f"Added {checkpoint_index.ntotal} vectors from checkpoint")
                
            except Exception as e:
                print(f"Error processing checkpoint {idx_file}: {e}")
                continue
        
        print(f"\nAggregation complete:")
        print(f"Total vectors: {combined_index.ntotal}")
        print(f"Total cases: {len(combined_mapping)}")
        
        # Save aggregated index
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        agg_index_path = os.path.join(checkpoint_dir, f"aggregated_index_{timestamp}.bin")
        agg_mapping_path = os.path.join(checkpoint_dir, f"aggregated_mapping_{timestamp}.json")
        
        faiss.write_index(combined_index, agg_index_path)
        with open(agg_mapping_path, 'w') as f:
            json.dump(combined_mapping, f)
            
        print(f"\nSaved aggregated files:")
        print(f"Index: {agg_index_path}")
        print(f"Mapping: {agg_mapping_path}")
        
        return combined_index, combined_mapping
        
    except Exception as e:
        print(f"Aggregation failed: {e}")
        return None, None
    
async def process_project(project_id, session, base_dir="downloads"):
    """
    For a given project, query its patients and process each patient's file.
    Uses a semaphore to limit concurrent requests while maintaining efficiency.
    """
    patients_df = await query_patients_by_project(project_id)
    if patients_df is None or patients_df.empty:
        print(f"No patients found for project {project_id}")
        return []

    # Create a semaphore to limit concurrent requests
    semaphore = asyncio.Semaphore(1)  

    async def process_with_rate_limit(case_id):
        async with semaphore:
            await asyncio.sleep(3)  # Rate limiting delay
            return await process_patient(case_id, session, base_dir)

    # Create tasks for all patients and process them concurrently
    tasks = [
        process_with_rate_limit(row["case_id"]) 
        for _, row in patients_df.iterrows()
    ]
    results = await asyncio.gather(*tasks)
    return results



