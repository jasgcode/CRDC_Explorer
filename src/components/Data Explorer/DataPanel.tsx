import React, { useState, useRef, useEffect } from 'react';
import { getPatients, getData, getGenomicData, FilterParams } from '../../api/index';
import ImagingDataPanel from './ImagingDataPanel';
import GenomicDataPanel from './GenomicPanel';

interface PatientInfo {
  id: string;
  disease_type: string;
}

interface DataPanelProps {
  selectedCollection: string;
  filters: FilterParams;
}

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
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
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
          const uniqueNewPatients = newPatients.filter(
            patient => !prevPatients.some(p => p.id === patient.id)
          );
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

  const handlePatientSelect = async (patientId: string) => {
    console.log('Selecting patient:', patientId);
    setSelectedPatient(patientId);
    setIsDataLoading(true);
    setDataError(null);
    setImagingData([]);
    setGenomicData([]);
    try {
      const [imagingResult, genomicResult] = await Promise.all([
        getData(patientId, selectedCollection),
        getGenomicData(patientId, filters)
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
        {patients.map((patient, index) => (
          <li
            key={`${patient.id}-${index}`}
            onClick={() => handlePatientSelect(patient.id)}
            className={`p-2 cursor-pointer hover:bg-gray-100 ${
              selectedPatient === patient.id ? 'bg-blue-100' : 'text-gray-700'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{patient.id}</span>
              <span className="text-sm text-gray-600">
                Disease: {patient.disease_type}
              </span>
            </div>
          </li>
        ))}
        {isLoading && <div className="text-center p-2">Loading more patients...</div>}
        {!isLoading && !hasMore && patients.length > 0 && (
          <div className="text-center p-2">No more patients to load.</div>
        )}
      </>
    );
  };

  const renderHeader = () => {
    if (!selectedCollection || selectedCollection === 'All Collections') {
      return (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800">Patient IDs</h3>
          <span className="text-sm text-gray-500">No collection selected</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">Patient IDs</h3>
        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
          {selectedCollection}
        </span>
      </div>
    );
  };


  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 mr-4 overflow-hidden flex flex-col h-[70vh]">
        {renderHeader()}
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