import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { FilterParams } from '../../api/index';
import FilterPanelComponent from './FilterPanelComponent';
import DataPanel from './DataPanel';

interface FilterState {
  filters: Record<string, string[]>;
  operations: Record<string, 'and' | 'or'>;
}

interface FilterPanelProps {
  isOpen: boolean;
  onCollectionSelect: (collection: string) => void;
  onFiltersChange: (filterState: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onCollectionSelect, onFiltersChange }) => (
  <div 
    className={`absolute top-0 left-0 h-full z-10 transition-all duration-300 ease-in-out ${
      isOpen ? 'w-80' : 'w-0'
    }`}
  >
    <div className="h-full bg-white border-r border-gray-200 shadow-lg">
      <FilterPanelComponent 
        isOpen={isOpen} 
        onCollectionSelect={onCollectionSelect} 
        onFiltersChange={onFiltersChange}
      />
    </div>
  </div>
);


interface DataGridProps {
  selectedCollection: string;
  filters: FilterState['filters'];  // Just pass the filters part to match DataPanel's expectations
  operations: FilterState['operations'];
}

const DataGrid: React.FC<DataGridProps> = ({ selectedCollection, filters, operations }) => (
  <div className="h-full w-full bg-white rounded-lg shadow-lg overflow-auto">
    <DataPanel 
      selectedCollection={selectedCollection} 
      filters={filters}
    />
  </div>
);



interface DataExplorerProps {}

const DataExplorer: React.FC<DataExplorerProps> = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [filterState, setFilterState] = useState<FilterState>({
    filters: {
      primary_sites: [],
      exp_strategies: [],
      data_categories: [],
      disease_types: [],
    },
    operations: {
      primary_sites: 'or',
      exp_strategies: 'or',
      data_categories: 'or',
      disease_types: 'or',
    },
  });

  const handleCollectionSelect = useCallback((collection: string) => {
    setSelectedCollection(collection);
  }, []);

  const handleFiltersChange = useCallback((newFilterState: FilterState) => {
    setFilterState(newFilterState);
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Data Explorer</h2>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center">
            <Search className="h-5 w-5 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Enter Patient ID"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            className={`p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
              isFilterOpen ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label={isFilterOpen ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-grow relative">
        <FilterPanel 
          isOpen={isFilterOpen}
          onCollectionSelect={handleCollectionSelect}
          onFiltersChange={handleFiltersChange}
        />
        
        <main 
          className={`flex-grow transition-all duration-300 ${
            isFilterOpen ? 'ml-80' : 'ml-0'
          }`}
        >
          <div className="p-4 h-full">
            <DataGrid 
              selectedCollection={selectedCollection} 
              filters={filterState.filters}
              operations={filterState.operations}
            />
          </div>
        </main>
      </div>
    </div>
  );
};


export default DataExplorer;