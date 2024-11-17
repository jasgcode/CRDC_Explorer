// Data Interfaces
export interface ImagingData {
    ohif_v2_url: string;
    ohif_v3_url: string;
    slim_url: string;
    series_aws_url: string;
    SeriesInstanceUID: string;
    StudyInstanceUID: string;
    Modality: string;
    SeriesDescription: string;
    SeriesNumber: string;
    StudyDate: string;
    StudyDescription: string;
  }
  
  
  export interface GenomicData {
    uuid: string;
    data_type: string;
    data_category: string;
    experimental_strategy: string;
    download_url: string;
  }
  
  export interface PatientInfo {
    id: string;
    disease_type: string;
  }
  
  export interface Collection {
    collection_id: string;
  }
  
  // Filter Interfaces
  export interface FilterState {
    filters: Record<string, string[]>;
    operations: Record<string, 'and' | 'or'>;
  }
  
  // Component Props Interfaces
  export interface ImagingDataPanelProps {
    selectedPatient: string | null;
    imagingData: ImagingData[];
    isDataLoading: boolean;
    dataError: string | null;
  }
  
  export interface GenomicDataPanelProps {
    selectedPatient: string | null;
    genomicData: GenomicData[];
    isDataLoading: boolean;
    dataError: string | null;
  }
  
  export interface ImagingDataCardProps {
    data: ImagingData;
  }
  
  export interface GenomicDataCardProps {
    data: GenomicData;
  }
  
  export interface FilterPanelProps {
    isOpen: boolean;
    onCollectionSelect: (collection: string) => void;
    onFiltersChange: (filterState: FilterState) => void;
  }
  
  export interface CheckboxGroupProps {
    title: string;
    items: string[];
    name: string;
    checkedItems: string[];
    onCheckedItemsChange: (name: string, items: string[]) => void;
    operation?: 'and' | 'or';
    onOperationChange?: (name: string, operation: 'and' | 'or') => void;
    showOperationToggle?: boolean;
  }
  
  export interface DropdownProps {
    options: Collection[];
    onSelect: (selected: string) => void;
  }
  
  export interface FilterPanelComponentProps {
    isOpen: boolean;
    onCollectionSelect: (collection: string) => void;
    onFiltersChange: (filterState: FilterState) => void;
  }
  export interface RequiredFilterParams {
    primary_sites: string[];
    exp_strategies: string[];
    data_categories: string[];
    disease_types: string[];
  }
  
  // Define the full FilterParams interface that includes optional properties
  export interface FilterParams extends Partial<RequiredFilterParams> {
    operations?: {
      primary_sites?: 'and' | 'or';
      exp_strategies?: 'and' | 'or';
      disease_types?: 'and' | 'or';
      data_categories?: 'and' | 'or';
    };
  }
  
  // Update DataPanelProps to use FilterParams
  export interface DataPanelProps {
    selectedCollection: string;
    filters: FilterParams;
  }
  