import React from 'react';

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
};

interface DataCardLinkProps {
  href: string;
  children: React.ReactNode;
}

export const DataCardLink: React.FC<DataCardLinkProps> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:text-blue-700 hover:underline"
  >
    {children}
  </a>
);

export const DataCardField: React.FC<{ label: string; value: string | number }> = ({
  label,
  value
}) => (
  <p className="text-sm mb-1">
    <span className="font-medium text-gray-700">{label}:</span>{' '}
    <span className="text-gray-900">{value}</span>
  </p>
);