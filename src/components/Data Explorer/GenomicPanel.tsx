import React, { useState, useRef, useEffect, useCallback } from 'react';
import GenomicDataCard from './Genomic_card';

interface GenomicDataPanelProps {
  selectedPatient: string | null;
  genomicData: GenomicData[];
  isDataLoading: boolean;
  dataError: string | null;
}

interface GenomicData {
  uuid: string;
  data_type: string;
  data_category: string;
  experimental_strategy: string;
  download_url: string;
}

const GenomicDataPanel: React.FC<GenomicDataPanelProps> = ({
    selectedPatient,
    genomicData,
    isDataLoading,
    dataError
  }) => {
    const [visibleCards, setVisibleCards] = useState<number>(10);
    const [hasMoreGenomic, setHasMoreGenomic] = useState(true);
    const genomicRef = useRef<HTMLDivElement>(null);
  
    const CARDS_PER_LOAD = 10;
  
    const loadMoreCards = useCallback(() => {
      if (!isDataLoading && hasMoreGenomic) {
        setVisibleCards(prevVisible => {
          const newVisible = Math.min(prevVisible + CARDS_PER_LOAD, genomicData.length);
          if (newVisible >= genomicData.length) {
            setHasMoreGenomic(false);
          }
          return newVisible;
        });
      }
    }, [isDataLoading, hasMoreGenomic, genomicData.length]);
  
    const handleGenomicScroll = useCallback(() => {
      if (genomicRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = genomicRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 20 && !isDataLoading && hasMoreGenomic) {
          loadMoreCards();
        }
      }
    }, [loadMoreCards, isDataLoading, hasMoreGenomic]);
  
    useEffect(() => {
      setVisibleCards(CARDS_PER_LOAD);
      setHasMoreGenomic(genomicData.length > CARDS_PER_LOAD);
    }, [genomicData]);
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
        <h3 className="font-bold text-gray-800 mb-2">Genomic Data</h3>
        {isDataLoading && genomicData.length === 0 ? (
          <p className="text-gray-600">Loading genomic data...</p>
        ) : dataError ? (
          <p className="text-red-500">{dataError}</p>
        ) : selectedPatient && genomicData.length > 0 ? (
          <>
            <p className="mb-2">Genomic data for {selectedPatient}:</p>
            <div ref={genomicRef} className="overflow-y-auto flex-grow" onScroll={handleGenomicScroll}>
              {genomicData.slice(0, visibleCards).map((item, index) => (
                <GenomicDataCard key={`${item.uuid}-${index}`} data={item} />
              ))}
              {isDataLoading && <p className="text-gray-600 mt-4">Loading more genomic data...</p>}
              {!isDataLoading && hasMoreGenomic && (
                <p className="text-gray-600 mt-4">Scroll to load more genomic data...</p>
              )}
              {!hasMoreGenomic && <p className="text-gray-600 mt-4">No more genomic data to load.</p>}
            </div>
          </>
        ) : (
          <p className="text-gray-600">No genomic data available for this patient.</p>
        )}
      </div>
    );
  };
  
  export default GenomicDataPanel;
  
  