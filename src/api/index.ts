import axios, { AxiosResponse } from 'axios';

// Types and Interfaces
export interface Collection {
  collection_id: string;
}

export interface FilterParams {
  primary_sites?: string[];
  exp_strategies?: string[];
  clinical_filters?: string[];
  metadata_filters?: string[];
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
    const response: AxiosResponse<Collection[]> = await axios.get('/api/collections');
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const getPatients = async (collection: string, filters: FilterParams): Promise<string[]> => {
  try {
    let queryString = '';
    
    const filterStrings = Object.entries(filters).map(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        return `${key}=${value.join(',')}`;
      }
      return null;
    }).filter(Boolean);

    if (filterStrings.length > 0) {
      queryString = filterStrings.join('&');
    }

    const encodedFilters = queryString ? encodeURIComponent(queryString) : '';

    const response: AxiosResponse<string> = await axios.get(`/api/patients/${collection}/${encodedFilters}`);
    
    const patientIds = response.data.split(',').map(id => id.trim());
    
    return patientIds;
  } catch (error) {
    console.error('Error fetching patients:', error);
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
        }
      ]
    };

    // Add experimental strategies filter
    if (filters.exp_strategies && filters.exp_strategies.length > 0) {
      gdcFilters.content.push({
        op: "in",
        content: {
          field: "experimental_strategy",
          value: filters.exp_strategies
        }
      });
    }

    const params = {
      filters: JSON.stringify(gdcFilters),
      fields: "file_id,data_type,data_category,experimental_strategy",
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
        download_url: `${baseDownloadUrl}${hit.file_id}`
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