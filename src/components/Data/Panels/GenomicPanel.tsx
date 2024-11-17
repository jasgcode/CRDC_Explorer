import React, { useRef } from 'react';
import { GenomicDataPanelProps } from '../../../types/interfaces';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import GenomicCard from '../Cards/Genomic_card';

const GenomicPanel: React.FC<GenomicDataPanelProps> = ({
  selectedPatient,
  genomicData,
  isDataLoading,
  dataError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, hasMore, isLoadingMore, handleScroll } = useInfiniteScroll({
    totalItems: genomicData.length
  });

  const handleContainerScroll = () => handleScroll(containerRef);

  if (isDataLoading && genomicData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[80vh]">
        <h3 className="font-bold text-gray-800 mb-2">Genomic Data</h3>
        <p className="text-gray-600">Loading genomic data...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[80vh]">
        <h3 className="font-bold text-gray-800 mb-2">Genomic Data</h3>
        <p className="text-red-500">{dataError}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
      <h3 className="font-bold text-gray-800 mb-2">Genomic Data</h3>
      
      {selectedPatient && genomicData.length > 0 ? (
        <>
          <p className="mb-2">Genomic data for {selectedPatient}:</p>
          <div
            ref={containerRef}
            className="overflow-y-auto flex-grow"
            onScroll={handleContainerScroll}
          >
            {genomicData.slice(0, visibleItems).map((item, index) => (
              <GenomicCard
                key={`${item.uuid}-${index}`}
                data={item}
              />
            ))}
            
            {isLoadingMore && (
              <p className="text-gray-600 text-center py-4">Loading more genomic data...</p>
            )}
            
            {!isLoadingMore && hasMore && (
              <p className="text-gray-600 text-center py-4">Scroll to load more genomic data...</p>
            )}
            
            {!hasMore && genomicData.length > 0 && (
              <p className="text-gray-600 text-center py-4">No more genomic data to load.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-600">No genomic data available for this patient.</p>
      )}
    </div>
  );
};

export default GenomicPanel;