import React, { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { DataPanelProps, PatientInfo } from '../../../types/interfaces';
import { usePatientData } from '../../../hooks/usePatientData';
import { useSelectedPatient } from '../../../hooks/useSelectedPatient';
import { PatientList } from '../PatientList';
import ImagingDataPanel from '../Panels/ImagingDataPanel';
import GenomicDataPanel from '../Panels/GenomicPanel';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';

const ITEMS_PER_PAGE = 20;

const DataPanel: React.FC<DataPanelProps> = ({ selectedCollection, filters }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [displayedPatients, setDisplayedPatients] = useState<PatientInfo[]>([]);
  
  const {
    patients,
    isLoading,
    isInitialLoad,
    error,
  } = usePatientData({ selectedCollection, filters });

  const {
    visibleItems,
    hasMore,
    isLoadingMore,
    handleScroll
  } = useInfiniteScroll({
    totalItems: patients.length,
    initialItemsPerPage: ITEMS_PER_PAGE,
    threshold: 200
  });

  const {
    selectedPatient,
    imagingData,
    genomicData,
    isDataLoading,
    dataError,
    handlePatientSelect
  } = useSelectedPatient(selectedCollection, filters);

  // Update displayed patients when visibility changes
  React.useEffect(() => {
    setDisplayedPatients(patients.slice(0, visibleItems));
  }, [patients, visibleItems]);

  // Handle scroll events
  const onScroll = useCallback(() => {
    if (listRef.current) {
      handleScroll(listRef);
    }
  }, [handleScroll]);

  const renderHeader = useCallback(() => {
    return (
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">Patient IDs</h3>
        {selectedCollection && selectedCollection !== 'All Collections' ? (
          <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {selectedCollection}
          </span>
        ) : (
          <span className="text-sm text-gray-500">No collection selected</span>
        )}
      </div>
    );
  }, [selectedCollection]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchError(null);
  }, []);

  const handleSearchSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchError('Please enter a Patient ID');
      return;
    }
    
    if (!selectedCollection || selectedCollection === 'All Collections') {
      setSearchError('Please select a collection first');
      return;
    }

    const foundPatient = patients.find(
      p => p.id.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (foundPatient) {
      handlePatientSelect(foundPatient.id);
      listRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSearchError(`Patient ID "${searchTerm}" not found in this collection`);
    }
  }, [searchTerm, selectedCollection, patients, handlePatientSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 mr-4 overflow-hidden flex flex-col h-[80vh]">
        {renderHeader()}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Patient ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-20 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              disabled={!selectedCollection || selectedCollection === 'All Collections'}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
          {searchError && (
            <p className="mt-2 text-sm text-red-500">{searchError}</p>
          )}
        </form>
        <ul 
          ref={listRef} 
          className="divide-y divide-gray-200 overflow-y-auto flex-grow" 
          onScroll={onScroll}
        >
          <PatientList
            patients={displayedPatients}
            selectedPatient={selectedPatient}
            isLoading={isLoading || isLoadingMore}
            isInitialLoad={isInitialLoad}
            hasMore={hasMore}
            error={error}
            selectedCollection={selectedCollection}
            onPatientSelect={handlePatientSelect}
            searchTerm={searchTerm}
            searchError={searchError}
          />
        </ul>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className="w-1/2 pr-2">
          <GenomicDataPanel
            selectedPatient={selectedPatient}
            genomicData={genomicData}
            isDataLoading={isDataLoading}
            dataError={dataError}
          />
        </div>
        <div className="w-1/2 pl-2">
          <ImagingDataPanel
            selectedPatient={selectedPatient}
            imagingData={imagingData}
            isDataLoading={isDataLoading}
            dataError={dataError}
          />
        </div>
      </div>
    </div>
  );
};

export default DataPanel;