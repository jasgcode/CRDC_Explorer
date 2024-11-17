import { useState, useEffect } from 'react';
import { PatientInfo, FilterParams } from '../types/interfaces';
import { apiService } from '../api';

interface UsePatientDataProps {
  selectedCollection: string;
  filters: FilterParams;
}

export const usePatientData = ({ selectedCollection, filters }: UsePatientDataProps) => {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async (offset: number = 0) => {
    if (isLoading || !hasMore || !selectedCollection || selectedCollection === 'All Collections') return;

    setIsLoading(true);
    setError(null);
    try {
      const newPatients = await apiService.getPatients(selectedCollection, filters);

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
      setError('Failed to load patients. Please try again later.');
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    setPatients([]);
    setHasMore(true);
    setError(null);
    setIsInitialLoad(true);

    if (selectedCollection && selectedCollection !== 'All Collections') {
      fetchPatients();
    } else {
      setIsInitialLoad(false);
    }
  }, [selectedCollection, filters]);

  return {
    patients,
    isLoading,
    isInitialLoad,
    hasMore,
    error,
    fetchPatients
  };
};