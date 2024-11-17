import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CheckboxGroupProps } from '../../types/interfaces';

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  items,
  name,
  checkedItems,
  onCheckedItemsChange,
  operation = 'or',
  onOperationChange,
  showOperationToggle = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedItemsChange(name, event.target.checked ? items : []);
  };

  const handleToggle = (item: string) => {
    const newCheckedItems = checkedItems.includes(item)
      ? checkedItems.filter(i => i !== item)
      : [...checkedItems, item];
    onCheckedItemsChange(name, newCheckedItems);
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        className="flex justify-between items-center w-full p-2 bg-gray-100 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <span className="font-bold">{title}</span>
          {checkedItems.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {checkedItems.length} selected
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-2 bg-white border rounded-md">
          <div className="p-2 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={checkedItems.length === items.length}
                onChange={handleToggleAll}
              />
              <span className="ml-2">Check All</span>
            </label>
            {showOperationToggle && onOperationChange && (
              <div className="flex items-center space-x-2 text-sm">
                <button
                  type="button"
                  className={`px-2 py-1 rounded ${
                    operation === 'or'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => onOperationChange(name, 'or')}
                >
                  OR
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded ${
                    operation === 'and'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => onOperationChange(name, 'and')}
                >
                  AND
                </button>
              </div>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {items.map(item => (
              <label key={item} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name={name}
                  value={item}
                  checked={checkedItems.includes(item)}
                  onChange={() => handleToggle(item)}
                />
                <span className="ml-2">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};