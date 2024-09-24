import React, { useState, useRef, useEffect } from 'react';

const DataPanel: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const fetchMorePatients = () => {
    setIsLoading(true);
    // Simulate fetching more patients (replace with your actual API call)
    setTimeout(() => {
      const newPatients = Array.from({ length: 10 }, (_, i) => `Patient ${patients.length + i + 1}`);
      setPatients([...patients, ...newPatients]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchMorePatients();
  }, []);

  const handleScroll = () => {
    if (listRef.current && !isLoading) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        fetchMorePatients();
      }
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 mr-4 overflow-auto">
        <h3 className="font-bold text-gray-800 mb-2">Patient IDs</h3>
        <ul ref={listRef} className="divide-y divide-gray-200 h-64 overflow-y-auto" onScroll={handleScroll}>
          {patients.map((patientId) => (
            <li
              key={patientId}
              onClick={() => setSelectedPatient(patientId)}
              className={`py-2 cursor-pointer hover:bg-gray-100 ${
                selectedPatient === patientId ? 'bg-blue-100 text-white' : 'text-gray-700'
              }`}
            >
              {patientId}
            </li>
          ))}
          {isLoading && <div className="text-center p-2">Loading...</div>}
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