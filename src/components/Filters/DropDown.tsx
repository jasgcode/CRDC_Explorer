import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collection, DropdownProps } from '../../types/interfaces';

export const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Select Collections');

  const handleSelect = (option: Collection | { collection_id: string }) => {
    setSelected(option.collection_id);
    onSelect(option.collection_id);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      <button
        className="w-full p-2 bg-white border rounded-md flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <li
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleSelect({ collection_id: 'All Collections' })}
          >
            All Collections
          </li>
          {options.map((option) => (
            <li
              key={option.collection_id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option.collection_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};