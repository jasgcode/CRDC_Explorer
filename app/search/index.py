import faiss
import numpy as np
import pandas as pd
import os
from process import process_file_in_chunks, process_project, save_faiss_index, query_all_projects, MIN_PATIENTS, load_most_recent_save
import aiohttp, asyncio
from aiohttp import ClientTimeout, TCPConnector
from aiohttp.client_exceptions import ClientError
import backoff 
@backoff.on_exception(
    backoff.expo,
    (ClientError, asyncio.TimeoutError),
    max_tries=5
)
async def main_pipeline(base_dir="downloads"):

    timeout = ClientTimeout(total=300)  # 5 minute timeout
    connector = TCPConnector(
        limit=10,  # Limit concurrent connections
        force_close=True,
        enable_cleanup_closed=True
    )
    
    async with aiohttp.ClientSession(
        timeout=timeout,
        connector=connector,
        headers={'Connection': 'close'}
    ) as session:
        if load_most_recent_save():
            print("Successfully loaded previous progress")
        else:
            print("Starting fresh processing")
        projects_df = await query_all_projects()
        if projects_df is None:
            print("No projects found.")
            return

        projects_df["case_count"] = pd.to_numeric(projects_df["case_count"], errors="coerce")
        filtered_projects = projects_df[projects_df["case_count"] >= MIN_PATIENTS]
        print(filtered_projects[["project_id", "name", "case_count"]])

        tasks = [
            process_project(row["project_id"], session, base_dir)
            for _, row in filtered_projects.iterrows()
        ]
        all_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out errors and save successful results
        successful_results = [r for r in all_results if not isinstance(r, Exception)]
        save_faiss_index()
        return successful_results



asyncio.run(main_pipeline())