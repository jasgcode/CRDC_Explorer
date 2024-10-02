import React from 'react';

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

interface ImagingDataCardProps {
  data: ImagingData;
}

const ImagingDataCard: React.FC<ImagingDataCardProps> = ({ data }) => {
  return (
    <div className="mb-4 p-4 border rounded shadow-sm">
      <h4 className="font-semibold mb-2">Series {data.SeriesNumber}: {data.SeriesDescription}</h4>
      <p>Modality: {data.Modality}</p>
      <p>Study Date: {data.StudyDate}</p>
      <p>Study Description: {data.StudyDescription}</p>
      <ul className="list-disc list-inside mt-2">
        <li>
          <a href={data.ohif_v2_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            OHIF v2 Viewer
          </a>
        </li>
        <li>
          <a href={data.ohif_v3_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            OHIF v3 Viewer
          </a>
        </li>
        <li>
          <a href={data.slim_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            SliM Viewer
          </a>
        </li>
        <li>
          <a href={data.series_aws_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            AWS S3 Bucket
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ImagingDataCard;