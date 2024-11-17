import React from 'react';
import { ImagingDataCardProps } from '../../../types/interfaces';
import { DataCard, DataCardLink, DataCardField } from './DataCard';

const ImagingCard: React.FC<ImagingDataCardProps> = ({ data }) => {
  const viewerLinks = [
    { name: 'OHIF v2 Viewer', url: data.ohif_v2_url },
    { name: 'OHIF v3 Viewer', url: data.ohif_v3_url },
    { name: 'SliM Viewer', url: data.slim_url },
    { name: 'AWS S3 Bucket', url: data.series_aws_url }
  ];

  return (
    <DataCard>
      <h4 className="font-semibold mb-3 text-lg">
        Series {data.SeriesNumber}: {data.SeriesDescription}
      </h4>
      
      <div className="space-y-2">
        <DataCardField label="Modality" value={data.Modality} />
        <DataCardField label="Study Date" value={data.StudyDate} />
        <DataCardField label="Study Description" value={data.StudyDescription} />
        
        <div className="mt-4">
          <p className="font-medium text-sm text-gray-700 mb-2">Available Viewers:</p>
          <ul className="space-y-1">
            {viewerLinks.map((link, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">•</span>
                <DataCardLink href={link.url}>{link.name}</DataCardLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DataCard>
  );
};

export default ImagingCard;