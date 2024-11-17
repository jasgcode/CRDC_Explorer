import React, { useRef } from 'react';
import { ImagingDataPanelProps } from '../../../types/interfaces';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import ImagingCard from '../Cards/Imaging_card';

const ImagingPanel: React.FC<ImagingDataPanelProps> = ({
  selectedPatient,
  imagingData,
  isDataLoading,
  dataError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, hasMore, isLoadingMore, handleScroll } = useInfiniteScroll({
    totalItems: imagingData.length
  });

  const handleContainerScroll = () => handleScroll(containerRef);

  if (isDataLoading && imagingData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[80vh]">
        <h3 className="font-bold text-gray-800 mb-2">Imaging Data</h3>
        <p className="text-gray-600">Loading imaging data...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[80vh]">
        <h3 className="font-bold text-gray-800 mb-2">Imaging Data</h3>
        <p className="text-red-500">{dataError}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
      <h3 className="font-bold text-gray-800 mb-2">Imaging Data</h3>
      
      {selectedPatient && imagingData.length > 0 ? (
        <>
          <p className="mb-2">Imaging data for {selectedPatient}:</p>
          <div
            ref={containerRef}
            className="overflow-y-auto flex-grow"
            onScroll={handleContainerScroll}
          >
            {imagingData.slice(0, visibleItems).map((item, index) => (
              <ImagingCard
                key={`${item.SeriesInstanceUID}-${index}`}
                data={item}
              />
            ))}
            
            {isLoadingMore && (
              <p className="text-gray-600 text-center py-4">Loading more imaging data...</p>
            )}
            
            {!isLoadingMore && hasMore && (
              <p className="text-gray-600 text-center py-4">Scroll to load more imaging data...</p>
            )}
            
            {!hasMore && imagingData.length > 0 && (
              <p className="text-gray-600 text-center py-4">No more imaging data to load.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-600">No imaging data available for this patient.</p>
      )}
    </div>
  );
};

export default ImagingPanel;