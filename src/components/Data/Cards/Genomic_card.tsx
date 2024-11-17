import React from 'react';
import { GenomicDataCardProps } from '../../../types/interfaces';
import { DataCard, DataCardLink, DataCardField } from './DataCard';

const GenomicCard: React.FC<GenomicDataCardProps> = ({ data }) => {
  return (
    <DataCard>
      <h4 className="text-lg font-semibold mb-3">{data.data_type}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <DataCardField label="Category" value={data.data_category} />
          <DataCardField label="Strategy" value={data.experimental_strategy} />
        </div>
        
        <div className="space-y-2">
          <DataCardField label="UUID" value={data.uuid} />
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Download:</span>
            <DataCardLink href={data.download_url}>
              <span className="flex items-center">
                Download Data
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </span>
            </DataCardLink>
          </div>
        </div>
      </div>
    </DataCard>
  );
};

export default GenomicCard;