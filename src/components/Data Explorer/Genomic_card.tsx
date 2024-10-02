import React from 'react';

interface GenomicData {
  uuid: string;
  data_type: string;
  data_category: string;
  experimental_strategy: string;
  download_url: string;
}

interface GenomicDataCardProps {
  data: GenomicData;
}

const GenomicDataCard: React.FC<GenomicDataCardProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h4 className="text-lg font-semibold mb-2">{data.data_type}</h4>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-medium">Category:</span> {data.data_category}</p>
        <p><span className="font-medium">Strategy:</span> {data.experimental_strategy}</p>
        <p><span className="font-medium">UUID:</span> {data.uuid}</p>
        <p>
          <span className="font-medium">Download:</span>
          <a 
            href={data.download_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-700 ml-1"
          >
            Link
          </a>
        </p>
      </div>
    </div>
  );
};

export default GenomicDataCard;