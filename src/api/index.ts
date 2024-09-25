import axios, { AxiosResponse } from 'axios';

// Define interfaces for your data structures
export interface Collection {
  collection_id: string;
  // Add other properties as needed
}

export interface Patient {
  PatientID: string;
  // Add other properties as needed
}

interface DataParams {
  PatientID?: string;
  primary_sites?: string;
  experimental_strategies?: string;
  // Add other possible parameters
}

interface DataResponse {
  // Define the structure of your data response
  // This will depend on what your Flask backend returns
}

export const getCollections = async (): Promise<Collection[]> => {
  try {
    const response: AxiosResponse<Collection[]> = await axios.get('/api/collections');
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const getPatients = async (collection: string, filters?: string): Promise<Patient[]> => {
  try {
    const response: AxiosResponse<Patient[]> = await axios.get(`/api/patients/${collection}/${filters || ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getData = async (params: DataParams): Promise<DataResponse> => {
  try {
    const response: AxiosResponse<DataResponse> = await axios.get('/api/data', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Add other API calls as needed