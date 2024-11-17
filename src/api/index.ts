import { gdcClient, localClient } from './client';
import { API_CONFIG } from './config';
import type { 
  Collection, 
  FilterParams, 
  PatientInfo, 
  PatientData, 
  GenomicData,
  GDCResponse,
  GDCCasesResponse 
} from './types';

class APIService {
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await gdcClient.get<GDCResponse>(API_CONFIG.GDC.ENDPOINTS.PROJECTS, {
        params: {
          fields: 'project_id',
          size: 10000
        }
      });

      if (!response.data?.data?.hits) {
        throw new Error('Invalid API response structure');
      }

      const collections = response.data.data.hits
        .filter(project => project?.project_id)
        .map(project => ({
          collection_id: project.project_id
        }))
        .sort((a, b) => a.collection_id.localeCompare(b.collection_id));

      return collections;
    } catch (error) {
      console.error('Error in getCollections:', error);
      throw error;
    }
  }

  async getPatients(collection: string, params: FilterParams): Promise<PatientInfo[]> {
    try {
      const gdcFilters = {
        op: "and",
        content: [
          {
            op: "in",
            content: {
              field: "cases.project.project_id",
              value: [collection]
            }
          },
          ...Object.entries({
            'cases.primary_site': params.primary_sites,
            'cases.disease_type': params.disease_types,
            'files.experimental_strategy': params.exp_strategies,
            'files.data_category': params.data_categories
          })
          .filter(([_, values]) => values?.length)
          .map(([field, values]) => ({
            op: "in",
            content: { field, value: values }
          }))
        ]
      };

      const response = await gdcClient.get<GDCCasesResponse>(API_CONFIG.GDC.ENDPOINTS.CASES, {
        params: {
          filters: JSON.stringify(gdcFilters),
          fields: 'submitter_id,disease_type',
          size: 1000
        }
      });

      return response.data.data.hits.map(hit => ({
        id: hit.submitter_id,
        disease_type: hit.disease_type || 'Not Specified'
      }));
    } catch (error) {
      console.error('Error in getPatients:', error);
      throw error;
    }
  }

  async getPatientData(patientId: string, collection: string): Promise<PatientData> {
    try {
      const response = await localClient.get<PatientData>('/data', {
        params: { collection, PatientID: patientId }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getPatientData:', error);
      throw error;
    }
  }

  async getGenomicData(patientId: string, filters: FilterParams): Promise<GenomicData[]> {
    try {
      const gdcFilters = {
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
            op: "=",
            content: {
              field: "access",
              value: "open"
            }
          },
          ...Object.entries({
            'experimental_strategy': filters.exp_strategies,
            'data_category': filters.data_categories,
            'cases.disease_type': filters.disease_types
          })
          .filter(([_, values]) => values?.length)
          .map(([field, values]) => ({
            op: "in",
            content: { field, value: values }
          }))
        ]
      };

      const response = await gdcClient.get(API_CONFIG.GDC.ENDPOINTS.FILES, {
        params: {
          filters: JSON.stringify(gdcFilters),
          fields: "file_id,data_type,data_category,experimental_strategy,access",
          size: 100
        }
      });

      return response.data.data.hits.map((hit: any) => ({
        uuid: hit.file_id,
        data_type: hit.data_type,
        data_category: hit.data_category,
        experimental_strategy: hit.experimental_strategy || "N/A",
        download_url: `${API_CONFIG.GDC.BASE_URL}${API_CONFIG.GDC.ENDPOINTS.DATA}/${hit.file_id}`,
        access: hit.access
      }));
    } catch (error) {
      console.error('Error in getGenomicData:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();
export * from './types';