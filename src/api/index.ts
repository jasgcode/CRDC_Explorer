import axios, { AxiosResponse } from 'axios';

// Types and Interfaces
export interface Collection {
  collection_id: string;
}
interface PatientInfo {
  id: string;
  disease_type: string;
}
interface GDCResponse {
  data: {
    hits: Array<{
      project_id: string;
    }>;
    pagination: {
      count: number;
      total: number;
      size: number;
      from: number;
      page: number;
      pages: number;
    };
  };
}

export interface FilterParams {
  primary_sites?: string[];
  exp_strategies?: string[];
  clinical_filters?: string[];
  metadata_filters?: string[];
  data_categories?: string[];
  disease_types?: string[];
  operations?: {
    primary_sites?: 'and' | 'or';
    exp_strategies?: 'and' | 'or';
    disease_types?: 'and' | 'or';
    data_categories?: 'and' | 'or';
  };
}

interface GDCCasesResponse {
  data: {
    hits: Array<{
      submitter_id: string;
      case_id: string;
      disease_type: string;  // Added disease_type
    }>;
    pagination: {
      count: number;
      total: number;
      size: number;
      from: number;
    };
  };
}



export interface ImagingData {
  ohif_v2_url: string;
  ohif_v3_url: string;
  slim_url: string;
}

export interface GenomicData {
  uuid: string;
  data_type: string;
  data_category: string;
  experimental_strategy: string;
  download_url: string;
}

export interface PatientData extends Array<ImagingData> {}

// API Functions
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const response: AxiosResponse<GDCResponse> = await axios.get('https://api.gdc.cancer.gov/projects', {
      params: {
        size: 10000,
        format: 'json',
        fields: 'project_id'
      }
    });
    
    // Add validation and error checking
    if (!response.data?.data?.hits) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid API response structure');
    }

    const collections = response.data.data.hits
      .filter(project => project && project.project_id) // Filter out any null/undefined values
      .map(project => ({
        collection_id: project.project_id
      }));

    // Verify we have valid data before sorting
    if (!collections.length) {
      console.warn('No collections found in response');
      return [];
    }

    return collections.sort((a, b) => {
      if (!a?.collection_id || !b?.collection_id) {
        console.warn('Invalid collection found:', { a, b });
        return 0; // Keep invalid items in place
      }
      return a.collection_id.localeCompare(b.collection_id);
    });

  } catch (error) {
    console.error('Error in getCollections:', error);
    throw error;
  }
};

export const getPatients = async (collection: string, filters: FilterParams): Promise<PatientInfo[]> => {
  try {
    const gdcFilters: any = {
      op: "and",
      content: [
        {
          op: "in",
          content: {
            field: "cases.project.project_id",
            value: [collection]
          }
        }
      ]
    };

    // Handle primary sites with configurable AND/OR
    if (filters.primary_sites?.length) {
      const operation = filters.operations?.primary_sites || 'or';
      if (operation === 'or') {
        gdcFilters.content.push({
          op: "in",
          content: {
            field: "cases.primary_site",
            value: filters.primary_sites
          }
        });
      } else {
        // For AND operation, create separate conditions for each value
        filters.primary_sites.forEach(site => {
          gdcFilters.content.push({
            op: "=",
            content: {
              field: "cases.primary_site",
              value: site
            }
          });
        });
      }
    }

    // Handle disease types with configurable AND/OR
    if (filters.disease_types?.length) {
      const operation = filters.operations?.disease_types || 'or';
      if (operation === 'or') {
        gdcFilters.content.push({
          op: "in",
          content: {
            field: "cases.disease_type",
            value: filters.disease_types
          }
        });
      } else {
        filters.disease_types.forEach(type => {
          gdcFilters.content.push({
            op: "=",
            content: {
              field: "cases.disease_type",
              value: type
            }
          });
        });
      }
    }

    // Handle experimental strategies with configurable AND/OR
    if (filters.exp_strategies?.length) {
      const operation = filters.operations?.exp_strategies || 'or';
      if (operation === 'or') {
        gdcFilters.content.push({
          op: "in",
          content: {
            field: "files.experimental_strategy",
            value: filters.exp_strategies
          }
        });
      } else {
        filters.exp_strategies.forEach(strategy => {
          gdcFilters.content.push({
            op: "=",
            content: {
              field: "files.experimental_strategy",
              value: strategy
            }
          });
        });
      }
    }

    // Handle data categories with configurable AND/OR
    if (filters.data_categories?.length) {
      const operation = filters.operations?.data_categories || 'or';
      if (operation === 'or') {
        gdcFilters.content.push({
          op: "in",
          content: {
            field: "files.data_category",
            value: filters.data_categories
          }
        });
      } else {
        filters.data_categories.forEach(category => {
          gdcFilters.content.push({
            op: "=",
            content: {
              field: "files.data_category",
              value: category
            }
          });
        });
      }
    }

    // Make request to GDC API
    const response: AxiosResponse<GDCCasesResponse> = await axios.get(
      'https://api.gdc.cancer.gov/cases',
      {
        params: {
          filters: JSON.stringify(gdcFilters),
          fields: 'submitter_id,disease_type',
          size: 1000,
          format: 'json'
        }
      }
    );

    return response.data.data.hits.map(hit => ({
      id: hit.submitter_id,
      disease_type: hit.disease_type || 'Not Specified'
    }));

  } catch (error) {
    console.error('Error fetching patients from GDC:', error);
    throw error;
  }
};


export const getData = async (patientId: string, collection: string): Promise<PatientData> => {
  try {
    const response: AxiosResponse<PatientData> = await axios.get('/api/data', {
      params: { collection, PatientID: patientId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient data:', error);
    throw error;
  }
};
export const getGenomicData = async (
  patientId: string,
  filters: FilterParams
): Promise<GenomicData[]> => {
  try {
    const baseUrl = "https://api.gdc.cancer.gov/files";
    const baseDownloadUrl = "https://api.gdc.cancer.gov/data/";

    const gdcFilters: any = {
      op: "and",
      content: [
        {
          op: "in",
          content: {
            field: "cases.submitter_id",
            value: [patientId]
          }
        },
        {
          // Only get open access data
          op: "=",
          content: {
            field: "access",
            value: "open"
          }
        },
  
      ]
    };

    // Add experimental strategies filter if provided
    if (filters.exp_strategies && filters.exp_strategies.length > 0) {
      gdcFilters.content.push({
        op: "in",
        content: {
          field: "experimental_strategy",
          value: filters.exp_strategies
        }
      });
    }
    if (filters.data_categories && filters.data_categories.length > 0) {
      gdcFilters.content.push({
        op: "in",
        content: {
          field: "data_category",
          value: filters.data_categories
        }
      });
    }
    if (filters.disease_types && filters.disease_types.length > 0) {
      gdcFilters.content.push({
        op: "in",
        content: {
          field: "cases.disease_type",
          value: filters.disease_types
        }
      });
    }
    const params = {
      filters: JSON.stringify(gdcFilters),
      fields: "file_id,data_type,data_category,experimental_strategy,access",
      format: "JSON",
      size: "100"
    };

    const response: AxiosResponse = await axios.get(baseUrl, { params });

    if (response.status === 200 && response.data.data && response.data.data.hits) {
      return response.data.data.hits.map((hit: any) => ({
        uuid: hit.file_id,
        data_type: hit.data_type,
        data_category: hit.data_category,
        experimental_strategy: hit.experimental_strategy || "N/A",
        download_url: `${baseDownloadUrl}${hit.file_id}`,
        access: hit.access
      }));
    } else {
      console.error("Unexpected response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching genomic data:', error);
    throw error;
  }
};