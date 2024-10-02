import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getPatients, getData, getGenomicData, FilterParams } from '../../api/index';
import ImagingDataPanel from './ImagingDataPanel';
import GenomicDataPanel from './GenomicPanel';

interface DataPanelProps {
  selectedCollection: string;
  filters: FilterParams;
}

type PatientIdentifier = string;

interface GenomicData {
  uuid: string;
  data_type: string;
  data_category: string;
  experimental_strategy: string;
  download_url: string;
}

interface ImagingData {
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

const DataPanel: React.FC<DataPanelProps> = ({ selectedCollection, filters }) => {
  const [patients, setPatients] = useState<PatientIdentifier[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientIdentifier | null>(null);
  const [imagingData, setImagingData] = useState<ImagingData[]>([]);
  const [genomicData, setGenomicData] = useState<GenomicData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const fetchPatients = async (offset: number = 0) => {
    if (isLoading || !hasMore || !selectedCollection || selectedCollection === 'All Collections') return;

    setIsLoading(true);
    setError(null);
    try {
      const newPatients = await getPatients(selectedCollection, filters);
      console.log('Fetched patients:', newPatients);

      if (newPatients.length === 0) {
        setHasMore(false);
      } else {
        setPatients(prevPatients => {
          const uniqueNewPatients = newPatients.filter(id => !prevPatients.includes(id));
          return [...prevPatients, ...uniqueNewPatients];
        });
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
    setImagingData([]);
    setGenomicData([]);
    setIsInitialLoad(true);

    if (selectedCollection && selectedCollection !== 'All Collections') {
      fetchPatients();
    } else {
      setIsInitialLoad(false);
    }
  }, [selectedCollection, filters]);

  const handlePatientSelect = async (patientId: PatientIdentifier) => {
    console.log('Selecting patient:', patientId);
    setSelectedPatient(patientId);
    setIsDataLoading(true);
    setDataError(null);
    setImagingData([]);
    setGenomicData([]);
    try {
      const [imagingResult, genomicResult] = await Promise.all([
        getData(patientId, selectedCollection),
        getGenomicData(patientId, filters)  // Use the filters here
      ]);
      console.log('Received patient data:', imagingResult, genomicResult);
      setImagingData(imagingResult as ImagingData[]);
      setGenomicData(genomicResult);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setDataError('Failed to load patient data. Please try again later.');
    } finally {
      setIsDataLoading(false);
    }
  };


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
            onClick={() => handlePatientSelect(patientId)}
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
      <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 mr-4 overflow-hidden flex flex-col h-[70vh]">
        <h3 className="font-bold text-gray-800 mb-2">Patient IDs</h3>
        <ul 
          ref={listRef} 
          className="divide-y divide-gray-200 overflow-y-auto flex-grow" 
          onScroll={handleScroll}
        >
          {renderPatientList()}
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