# This script contains functions to query the GDC (Genomic Data Commons) API for patient and file information related to cancer research projects.
# Functions:
# - create_filters(case_id): Creates a filter dictionary for querying files based on a given case_id.
# - query_patients_by_project(project_id, size=100): Queries cases for a specific project and returns a DataFrame with case information.
# - query_gdc(case_id): Queries the GDC API for files related to a specific case_id and returns a DataFrame with file information.
# - query_all_patient_files(case_id): Queries the GDC API for all files related to a specific case_id and returns a DataFrame with file information.
# Example usage:
# - test = query_patients_by_project("TCGA-LUAD")
# - a = query_gdc(test['case_id'][0])
# - print(a)
import requests
import pandas as pd
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib.pyplot as plt
import aiohttp
import asyncio

from concurrent.futures import ProcessPoolExecutor


query = """
query FileSearch($filters: FiltersArgument) {
  repository {
    files {
      hits(first: 100, filters: $filters) {
        edges {
          node {
            file_id
            file_name
            data_category
            data_format
            experimental_strategy
            access
            analysis {
              workflow_type
            }
            cases {
              hits(first: 1) {
                edges {
                  node {
                    case_id
                    submitter_id
                    project {
                      project_id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
"""
def create_filters(case_id):
    return {
      "op": "and",
      "content": [
        {
          "op": "in",
          "content": {
            "field": "cases.case_id",
            "value": [case_id]
          }
        },
        {
          "op": "=",
          "content": {
            "field": "data_category",
            "value": "Transcriptome Profiling"
          }
        },
        {
          "op": "=",
          "content": {
            "field": "analysis.workflow_type",
            "value": "STAR - Counts"
          }
        },
        {
          "op": "=",
          "content": {
            "field": "data_format",
            "value": "TSV"
          }
        },
        {
          "op": "=",
          "content": {
            "field": "access",
            "value": "open"
          }
        }
      ]
    }
    
async def query_patients_by_project(project_id, size=10000):
    """Query cases for a specific project."""
    cases_query = """
    query ProjectCases($filters: FiltersArgument, $size: Int) {
      repository {
        cases {
          hits(first: $size, filters: $filters) {
            edges {
              node {
                case_id
                submitter_id
                project {
                  project_id
                }
              }
            }
          }
        }
      }
    }
    """

    filters = {
        "op": "and",
        "content": [
            # Filter for the project.
            {
                "op": "=",
                "content": {
                    "field": "project.project_id",
                    "value": project_id
                }
            },
            # Ensure the case has files with Transcriptome Profiling data.
            {
                "op": "in",
                "content": {
                    "field": "files.data_category",
                    "value": ["Transcriptome Profiling"]
                }
            },
            {
                "op": "=",
                "content": {
                    "field": "files.analysis.workflow_type",
                    "value": "STAR - Counts"
                }
            },
            {
                "op": "=",
                "content": {
                    "field": "files.data_format",
                    "value": "TSV"
                }
            },
            {
                "op": "=",
                "content": {
                    "field": "files.access",
                    "value": "open"
                }
            }
        ]
    }

    variables = {
        "filters": filters,
        "size": size
    }

    url = 'https://api.gdc.cancer.gov/v0/graphql'
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json={'query': cases_query, 'variables': variables}) as response:

            if response.status == 200:
                data = await response.json()
                cases = data['data']['repository']['cases']['hits']['edges']

                case_data = []
                for case in cases:
                    node = case['node']
                    case_info = {
                        'case_id': node['case_id'],
                        'submitter_id': node['submitter_id'],
                        'project_id': node['project']['project_id']
                    }
                    case_data.append(case_info)

                return pd.DataFrame(case_data)
            else:
                print(f"Request failed with status code: {response.status}")
                text = await response.json()
                print(text)
                return None

retry_delay = 5  # Define a retry delay in seconds

async def query_gdc(case_id):
  variables = {
    "filters": create_filters(case_id),
  }

  url = 'https://api.gdc.cancer.gov/v0/graphql'
  async with aiohttp.ClientSession() as session:
    async with session.post(url, json={'query': query, 'variables': variables}) as response:
        await asyncio.sleep(0.1)
        if response.status == 200:
            data = await response.json()
            files = data['data']['repository']['files']['hits']['edges']

            if files:
                node = files[0]['node']
                case = node['cases']['hits']['edges'][0]['node'] if node['cases']['hits']['edges'] else None
                file_info = {
                    'file_id': node['file_id'],
                    'file_name': node['file_name'],
                    'data_category': node['data_category'],
                    'data_format': node['data_format'],
                    'experimental_strategy': node['experimental_strategy'],
                    'workflow_type': node['analysis']['workflow_type'] if node['analysis'] else None,
                    'access': node['access'],
                    'case_id': case['case_id'] if case else None,
                    'submitter_id': case['submitter_id'] if case else None,
                    'project_id': case['project']['project_id'] if case and case['project'] else None
                }
                return pd.DataFrame([file_info])
        
                 # or return from the function as appropriate

            else:
                print("No file found for the given case_id.")
                return None
        elif response.status == 429:
                # Handle rate limiting: log error, retry, etc.
                print("Rate limit exceeded; delaying further requests...")
                # Optionally, read response.text() to log the error details.
                await asyncio.sleep(retry_delay)
        else:
            print(f"Request failed with status code: {response.status}")
         
            text = await response.json()
            print(text)
            return None
  
async def query_all_patient_files(case_id):
    variables = {
      "filters": create_filters(case_id),
      
    }

    url = 'https://api.gdc.cancer.gov/v0/graphql'
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json={'query': query, 'variables': variables}) as response:

            if response.status == 200:
                data = await response.json()
                files = data['data']['repository']['files']['hits']['edges']

                file_data = []
                for file in files:
                    node = file['node']
                    case = node['cases']['hits']['edges'][0]['node'] if node['cases']['hits']['edges'] else None
                    file_info = {
                        'file_id': node['file_id'],
                        'file_name': node['file_name'],
                        'data_category': node['data_category'],
                        'data_format': node['data_format'],
                        'experimental_strategy': node['experimental_strategy'],
                        'workflow_type': node['analysis']['workflow_type'] if node['analysis'] else None,
                        'access': node['access'],
                        'case_id': case['case_id'] if case else None,
                        'submitter_id': case['submitter_id'] if case else None,
                        'project_id': case['project']['project_id'] if case and case['project'] else None
                    }
                    file_data.append(file_info)


                return pd.DataFrame(file_data)
            else:
                print(f"Request failed with status code: {response.status}")
                print(response.json())
                return None
      
async def query_all_projects():
    """Query all available projects from GDC."""
    projects_query = """
    query Projects($size: Int) {
      projects {
        hits(first: $size) {
          edges {
            node {
              project_id
              name
              primary_site
              disease_type
              summary {
                case_count
              }
            }
          }
        }
      }
    }
    """

    variables = {"size": 2000}  # Adjust size as needed
    url = 'https://api.gdc.cancer.gov/v0/graphql'
    async with aiohttp.ClientSession() as session:
        async with await session.post(url, json={'query': projects_query, 'variables': variables}) as response:

            if response.status == 200:
                data = await response.json()
                projects = data['data']['projects']['hits']['edges']

                project_data = []
                for project in projects:
                    node = project['node']
                    project_info = {
                        'project_id': node['project_id'],
                        'name': node['name'],
                        'primary_site': node['primary_site'],
                        'disease_type': node['disease_type'],
                        'case_count': node['summary']['case_count']
                    }
                    project_data.append(project_info)

                return pd.DataFrame(project_data)
            else:
                print(f"Request failed with status code: {response.status}")
                return None


# min_patients = 20

# # Query all projects
# projects_df = query_all_projects()

# if projects_df is not None:
#     # Make sure case_count is numeric
#     projects_df['case_count'] = pd.to_numeric(projects_df['case_count'], errors='coerce')
    
#     # Filter projects with at least 'min_patients'
#     filtered_projects_df = projects_df[projects_df['case_count'] >= min_patients]
#     print(filtered_projects_df[['project_id', 'name', 'case_count']])
# else:
#     print("No projects found.")

# print(filtered_projects_df[['project_id', 'name', 'case_count']])

# test =  query_patients_by_project("TCGA-LUAD")
# case_ids = test['case_id'].tolist()
# print(case_ids)
# a = [query_gdc(case) for case in case_ids]
# valid_dfs = [df for df in a if df is not None and not df.empty]
# file_ids = [file['file_id'] for df in valid_dfs for file in df.to_dict('records')]
# print(file_ids)
# if valid_dfs:
#     # Combine all valid DataFrames into one.
#     combined_df = pd.concat(valid_dfs, ignore_index=True)
#     # Convert the combined DataFrame to a list of dictionaries.
#     metadata_list = combined_df.to_dict("records")
# else:
#     metadata_list = []
# print(metadata_list)
async def main():
    # Retrieve all projects as a DataFrame.
    min_patients = 20
    projects_df = await query_all_projects()
    
    if projects_df is not None:
        projects_df['case_count'] = pd.to_numeric(projects_df['case_count'], errors='coerce')
        filtered_projects_df = projects_df[projects_df['case_count'] >= min_patients]
    else:
        filtered_projects_df = None

    # Extract all project IDs from the DataFrame.
    project_ids = filtered_projects_df['project_id'].tolist()
    print(f"Found {len(project_ids)} projects.")
    
    # Create a list of tasks to query patients for each project concurrently.
    tasks = [query_patients_by_project(pid) for pid in project_ids]
    
    # Wait for all tasks to complete.
    patients_dfs = await asyncio.gather(*tasks)
    
    # Filter out any None or empty DataFrames.
    valid_patients_dfs = [df for df in patients_dfs if df is not None and not df.empty]
    
    if valid_patients_dfs:
        # Optionally, combine all patient DataFrames into one.
        combined_patients_df = pd.concat(valid_patients_dfs, ignore_index=True)
        print("Combined Patients DataFrame:")
        print(combined_patients_df)
    else:
        print("No patient data found for any projects.")

# Run the async main function
asyncio.run(main())
