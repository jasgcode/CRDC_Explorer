import { AxiosResponse } from 'axios';
import { ImagingData } from '../types/interfaces';
// GDC API Response Types
export interface GDCResponse {
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

export interface GDCCasesResponse {
  data: {
    hits: Array<{
      submitter_id: string;
      case_id: string;
      disease_type: string;
    }>;
    pagination: {
      count: number;
      total: number;
      size: number;
      from: number;
    };
  };
}

// Domain Types
export interface Collection {
  collection_id: string;
}

export interface PatientInfo {
  id: string;
  disease_type: string;
}

export interface GenomicData {
  uuid: string;
  data_type: string;
  data_category: string;
  experimental_strategy: string;
  download_url: string;
  access?: string;
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

export type PatientData = ImagingData[];