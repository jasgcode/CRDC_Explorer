import React from 'react';
import { PatientInfo } from '../../types/interfaces';

interface PatientListProps {
  patients: PatientInfo[];
  selectedPatient: string | null;
  isLoading: boolean;
  isInitialLoad: boolean;
  hasMore: boolean;
  error: string | null;
  selectedCollection: string;
  onPatientSelect: (patientId: string) => void;
  searchTerm: string;
  searchError?: string | null;
}

// Utility function to highlight matched text
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatient,
  isLoading,
  isInitialLoad,
  hasMore,
  error,
  selectedCollection,
  onPatientSelect,
  searchTerm,
  searchError
}) => {
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
    if (searchTerm) {
      return <div className="text-center p-4">No patients found matching "{searchTerm}"</div>;
    }
    return <div className="text-center p-4">No patients found in this collection.</div>;
  }
  if (searchError) {
    return <div className="text-center p-4 text-red-500">{searchError}</div>;
  }

  if (patients.length === 0 && !isLoading) {
    if (searchTerm) {
      return (
        <div className="text-center p-4">
          <p className="text-gray-600">No patients found matching "{searchTerm}"</p>
          <p className="text-sm text-gray-500 mt-2">
            Try searching with a complete Patient ID
          </p>
        </div>
      );
    }
    return <div className="text-center p-4">No patients found in this collection.</div>;
  }
  return (
    <>
      {patients.map((patient, index) => (
        <li
          key={`${patient.id}-${index}`}
          onClick={() => onPatientSelect(patient.id)}
          className={`p-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 
            ${selectedPatient === patient.id ? 'bg-blue-100' : 'text-gray-700'}`}
        >
          <div className="flex flex-col">
            <span className="font-medium">
              <HighlightText text={patient.id} highlight={searchTerm} />
            </span>
            <span className="text-sm text-gray-600">
              Disease: <HighlightText text={patient.disease_type} highlight={searchTerm} />
            </span>
          </div>
        </li>
      ))}
      {isLoading && <div className="text-center p-2">Loading more patients...</div>}
      {!isLoading && hasMore && patients.length > 0 && (
        <div className="text-center p-2">Scroll to load more patients...</div>
      )}
      {!hasMore && patients.length > 0 && (
        <div className="text-center p-2">No more patients to load.</div>
      )}
    </>
  );
};

export default PatientList;