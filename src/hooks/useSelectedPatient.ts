import { useState } from 'react';
import { ImagingData, GenomicData, FilterParams } from '../types/interfaces';
import { apiService } from '../api';

export const useSelectedPatient = (selectedCollection: string, filters: FilterParams) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [imagingData, setImagingData] = useState<ImagingData[]>([]);
  const [genomicData, setGenomicData] = useState<GenomicData[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatient(patientId);
    setIsDataLoading(true);
    setDataError(null);
    setImagingData([]);
    setGenomicData([]);

    try {
      const [imagingResult, genomicResult] = await Promise.all([
        apiService.getPatientData(patientId, selectedCollection),
        apiService.getGenomicData(patientId, filters)
      ]);
      
      setImagingData(imagingResult);
      setGenomicData(genomicResult);
    } catch (err) {
      setDataError('Failed to load patient data. Please try again later.');
      console.error('Error fetching patient data:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const resetPatientData = () => {
    setSelectedPatient(null);
    setImagingData([]);
    setGenomicData([]);
    setDataError(null);
  };

  return {
    selectedPatient,
    imagingData,
    genomicData,
    isDataLoading,
    dataError,
    handlePatientSelect,
    resetPatientData
  };
};