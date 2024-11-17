import React from 'react';
import { Search, Loader } from 'lucide-react';

interface SearchButtonProps {
  isLoading: boolean;
  disabled: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ isLoading, disabled }) => (
  <button
    type="submit"
    className={`
      absolute right-2 top-1/2 -translate-y-1/2 
      px-4 py-1 
      ${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} 
      text-white rounded-md transition-colors 
      flex items-center gap-2
    `}
    disabled={disabled || isLoading}
  >
    {isLoading ? (
      <>
        <Loader size={16} className="animate-spin" />
        <span>Searching...</span>
      </>
    ) : (
      <>
        <Search size={16} />
        <span>Search</span>
      </>
    )}
  </button>
);