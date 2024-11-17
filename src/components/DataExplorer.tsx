import React, { useState, useCallback } from 'react';
import { Filter } from 'lucide-react';
import { FilterParams } from '../api/index';
import FilterPanelComponent from './Filters/FilterPanelComponent';
import DataPanel from './Data/shared/DataPanel';
import { FilterPanelProps, FilterState } from '../types/interfaces';

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
  filters: FilterState['filters'];
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Data Explorer</h2>
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