import React, { useState, useRef, useEffect, useCallback } from 'react';
import ImagingDataCard from './Imaging_card';

interface ImagingDataPanelProps {
  selectedPatient: string | null;
  imagingData: ImagingData[];
  isDataLoading: boolean;
  dataError: string | null;
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

const ImagingDataPanel: React.FC<ImagingDataPanelProps> = ({
  selectedPatient,
  imagingData,
  isDataLoading,
  dataError
}) => {
  const [visibleCards, setVisibleCards] = useState<number>(10);
  const [hasMoreImaging, setHasMoreImaging] = useState(true);
  const imagingRef = useRef<HTMLDivElement>(null);

  const CARDS_PER_LOAD = 10;

  const loadMoreCards = useCallback(() => {
    if (!isDataLoading && hasMoreImaging) {
      setVisibleCards(prevVisible => {
        const newVisible = Math.min(prevVisible + CARDS_PER_LOAD, imagingData.length);
        if (newVisible >= imagingData.length) {
          setHasMoreImaging(false);
        }
        return newVisible;
      });
    }
  }, [isDataLoading, hasMoreImaging, imagingData.length]);

  const handleImagingScroll = useCallback(() => {
    if (imagingRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = imagingRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20 && !isDataLoading && hasMoreImaging) {
        loadMoreCards();
      }
    }
  }, [loadMoreCards, isDataLoading, hasMoreImaging]);

  useEffect(() => {
    setVisibleCards(CARDS_PER_LOAD);
    setHasMoreImaging(imagingData.length > CARDS_PER_LOAD);
  }, [imagingData]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
      <h3 className="font-bold text-gray-800 mb-2">Imaging Data</h3>
      {isDataLoading && imagingData.length === 0 ? (
        <p className="text-gray-600">Loading imaging data...</p>
      ) : dataError ? (
        <p className="text-red-500">{dataError}</p>
      ) : selectedPatient && imagingData.length > 0 ? (
        <>
          <p className="mb-2">Imaging data for {selectedPatient}:</p>
          <div ref={imagingRef} className="overflow-y-auto flex-grow" onScroll={handleImagingScroll}>
            {imagingData.slice(0, visibleCards).map((item, index) => (
              <ImagingDataCard key={`${item.SeriesInstanceUID}-${index}`} data={item} />
            ))}
            {isDataLoading && <p className="text-gray-600 mt-4">Loading more imaging data...</p>}
            {!isDataLoading && hasMoreImaging && (
              <p className="text-gray-600 mt-4">Scroll to load more imaging data...</p>
            )}
            {!hasMoreImaging && <p className="text-gray-600 mt-4">No more imaging data to load.</p>}
          </div>
        </>
      ) : (
        <p className="text-gray-600">No imaging data available for this patient.</p>
      )}
    </div>
  );
};

export default ImagingDataPanel;