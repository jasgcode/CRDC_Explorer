import React, { useState, useRef, useEffect } from 'react';
import { getPatients, Patient } from '../../api/index.ts';

interface DataPanelProps {
  selectedCollection: string;
}

type PatientIdentifier = string;

// Define the possible types of API responses
type APIResponse = string | PatientIdentifier[] | Patient[];

const DataPanel: React.FC<DataPanelProps> = ({ selectedCollection }) => {
  const [patients, setPatients] = useState<PatientIdentifier[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientIdentifier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const processAPIResponse = (response: APIResponse): PatientIdentifier[] => {
    if (typeof response === 'string') {
      // If it's a string, split it into an array
      return response.split(',').map(id => id.trim());
    } else if (Array.isArray(response)) {
      // If it's an array, map it to ensure we have an array of strings
      return response.map(item => typeof item === 'string' ? item : item.PatientID);
    }
    // If it's neither, return an empty array
    console.error('Unexpected API response format:', response);
    return [];
  };

  const fetchPatients = async (offset: number = 0) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const newPatients = await getPatients(selectedCollection, `offset=${offset}&limit=20`);
      console.log('Fetched patients:', newPatients); // Log the fetched data

      if (Array.isArray(newPatients) && newPatients.length === 0) {
        setHasMore(false);
      } else {
        const processedPatients = processAPIResponse(newPatients);
        setPatients(prevPatients => [...prevPatients, ...processedPatients]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    setPatients([]);
    setHasMore(true);
    setError(null);
    setSelectedPatient(null);
    setIsInitialLoad(true);

    if (selectedCollection && selectedCollection !== 'All Collections') {
      fetchPatients();
    } else {
      setIsInitialLoad(false);
    }
  }, [selectedCollection]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading && hasMore) {
        fetchPatients(patients.length);
      }
    }
  };

  const renderPatientList = () => {
    if (isInitialLoad) {
      return <div className="text-center p-4">Loading patients...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    if (!selectedCollection || selectedCollection === 'All Collections') {
      return <div className="text-center p-4">Please select a collection to view patients.</div>;
    }

    if (patients.length === 0 && !isLoading) {
      return <div className="text-center p-4">No patients found in this collection.</div>;
    }

    return (
      <>
        {patients.map((patientId, index) => (
          <li
            key={`${patientId}-${index}`}
            onClick={() => setSelectedPatient(patientId)}
            className={`py-2 cursor-pointer hover:bg-gray-100 ${
              selectedPatient === patientId ? 'bg-blue-100' : 'text-gray-700'
            }`}
          >
            {patientId}
          </li>
        ))}
        {isLoading && <div className="text-center p-2">Loading more patients...</div>}
        {!isLoading && !hasMore && patients.length > 0 && (
          <div className="text-center p-2">No more patients to load.</div>
        )}
      </>
    );
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 mr-4 overflow-auto">
        <h3 className="font-bold text-gray-800 mb-2">Patient IDs</h3>
        <ul 
          ref={listRef} 
          className="divide-y divide-gray-200 h-64 overflow-y-auto" 
          onScroll={handleScroll}
        >
          {renderPatientList()}
        </ul>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 mr-4">
          <h3 className="font-bold text-gray-800 mb-2">Genomic Data</h3>
          {selectedPatient ? (
            <p className="text-gray-600">Genomic data for {selectedPatient} will be displayed here.</p>
          ) : (
            <p className="text-gray-600">Select a patient to view genomic data.</p>
          )}
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-gray-800 mb-2">Imaging Data</h3>
          {selectedPatient ? (
            <p className="text-gray-600">Imaging data for {selectedPatient} will be displayed here.</p>
          ) : (
            <p className="text-gray-600">Select a patient to view imaging data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPanel;