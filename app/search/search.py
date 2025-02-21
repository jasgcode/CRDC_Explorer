import faiss
import os
import json
import numpy as np
from process import aggregate_checkpoints
def load_faiss(index_path="faiss_index.bin", mapping_path="case_mapping.json"):
    """
    Load the FAISS index and case ID mapping from disk
    
    Args:
        index_path (str): Path to the saved FAISS index file
        mapping_path (str): Path to the saved case mapping JSON file
    
    Returns:
        tuple: (faiss_index, case_mapping) or (None, None) if loading fails
    """
    try:
        # Load the FAISS index
        if not os.path.exists(index_path):
            print(f"FAISS index file not found at {index_path}")
            return None, None
            
        faiss_index = faiss.read_index(index_path)
        print(f"Loaded FAISS index with {faiss_index.ntotal} vectors")
        
        # Load the case mapping
        if not os.path.exists(mapping_path):
            print(f"Case mapping file not found at {mapping_path}")
            return None, None
            
        with open(mapping_path, 'r') as f:
            case_mapping = json.load(f)
        print(f"Loaded mapping for {len(case_mapping)} cases")
        
        return faiss_index, case_mapping
        
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        return None, None
    

def search_similar_cases(faiss_index, case_mapping, query_case_id, k=5):
    """
    Search for similar cases using cosine similarity
    """
    try:
        if query_case_id not in case_mapping:
            print(f"Case ID {query_case_id} not found in index")
            return []
            
        query_idx = case_mapping[query_case_id]
        
        # Get and normalize the query vector
        query_vector = faiss_index.reconstruct(query_idx)
        query_vector = query_vector / np.linalg.norm(query_vector)
        query_vector = query_vector.reshape(1, -1).astype('float32')
        
        # Get all vectors for proper normalization
        all_vectors = np.vstack([faiss_index.reconstruct(i) for i in range(faiss_index.ntotal)])
        all_vectors = all_vectors / np.linalg.norm(all_vectors, axis=1, keepdims=True)
        
        # Compute dot product (cosine similarity since vectors are normalized)
        similarities = np.dot(query_vector, all_vectors.T)[0]
        
        # Get top k+1 indices (including query)
        top_indices = np.argsort(similarities)[::-1][:k+1]
        
        # Create reverse mapping
        idx_to_case = {v: k for k, v in case_mapping.items()}
        
        # Format results, excluding query case
        results = []
        for idx in top_indices:
            case_id = idx_to_case[idx]
            if case_id != query_case_id:
                results.append((case_id, float(similarities[idx])))
                
        return results[:k]
        
    except Exception as e:
        print(f"Error during similarity search: {e}")
        return []

def search(id):
    index, mapping = load_faiss()
    if index is not None:
        similar_cases = search_similar_cases(index, mapping, id, k=5)
        return similar_cases
    return []
# Example usage
if __name__ == "__main__":
    aggregate_checkpoints()
    index, mapping = load_faiss()
    if index is not None:
        similar_cases = search_similar_cases(index, mapping, "d420e653-3fb2-432b-9e81-81232a80264d", k=5)
        print("\nMost similar cases:")
        for case_id, similarity in similar_cases:
            print(f"Case: {case_id}, Similarity: {similarity:.3f}")