  import React, { useState } from 'react';
  import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
  import {  FilterParams } from '../../api/index';
  import FilterPanelComponent from './FilterPanelComponent';
  import DataPanel from './DataPanel';

  interface FilterPanelProps {
    isOpen: boolean;
    onCollectionSelect: (collection: string) => void;
    onFiltersChange: (filters: Record<string, string[]>) => void;
  }

  const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onCollectionSelect, onFiltersChange }) => (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0'}`}>
      <div className="h-full bg-white border-r border-gray-200 shadow-lg">
        <FilterPanelComponent isOpen={isOpen} onCollectionSelect={onCollectionSelect} onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );

  interface DataGridProps {
    selectedCollection: string;
    filters: FilterParams;
  }

  const DataGrid: React.FC<DataGridProps> = ({ selectedCollection, filters }) => (
    <div className="h-full overflow-auto bg-white rounded-lg shadow-lg">
      <DataPanel selectedCollection={selectedCollection} filters={filters} />
    </div>
  );

  const DataExplorer: React.FC = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('All Collections');
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);   
      // Implement your search logic here
    };

    const handleCollectionSelect = (collection: string) => {
      setSelectedCollection(collection);
    };

    const handleFiltersChange = (newFilters: Record<string, string[]>) => {
      setFilters(newFilters);
      console.log('Current filters:', newFilters);
    };

    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Data Explorer</h1>
            <div className="relative flex items-center">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Enter Patient ID"
                value={searchTerm}
                onChange={handleSearch}
                className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <FilterPanel isOpen={isFilterOpen}
          onCollectionSelect={handleCollectionSelect}
          onFiltersChange={handleFiltersChange} />
          <main className="flex-grow p-2  bg-gray-50 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Data Results</h2>
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden px-4 py-4">
              <DataGrid selectedCollection={selectedCollection} filters ={filters} />
            </div>
          </main>
        </div>
      </div>
    );
  };

  export default DataExplorer;