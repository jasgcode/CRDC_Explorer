import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../api';
import { Collection, FilterPanelComponentProps } from '../../types/interfaces';
import { FILTER_OPTIONS, getFilterOptions } from './../Filters/FilterOptions';
import { Dropdown } from './../Filters/DropDown';
import { CheckboxGroup } from './../Filters/Checkbox';

const FilterPanelComponent: React.FC<FilterPanelComponentProps> = ({
  isOpen,
  onCollectionSelect,
  onFiltersChange,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({
    primary_sites: [],
    exp_strategies: [],
    data_categories: [],
    disease_types: [],
  });

  const [localOperations, setLocalOperations] = useState<Record<string, 'and' | 'or'>>({
    primary_sites: 'or',
    exp_strategies: 'or',
    data_categories: 'or',
    disease_types: 'or',
  });

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getCollections();
        setCollections(data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        setError('Failed to load collections. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const handleCheckedItemsChange = useCallback((name: string, items: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: items,
    }));
  }, []);

  const handleOperationChange = useCallback((name: string, operation: 'and' | 'or') => {
    setLocalOperations(prev => ({
      ...prev,
      [name]: operation,
    }));
  }, []);

  const handleApplyFilters = () => {
    onFiltersChange({
      filters: localFilters,
      operations: localOperations,
    });
  };

  const handleResetFilters = () => {
    setLocalFilters({
      primary_sites: [],
      exp_strategies: [],
      data_categories: [],
      disease_types: [],
    });
    setLocalOperations({
      primary_sites: 'or',
      exp_strategies: 'or',
      data_categories: 'or',
      disease_types: 'or',
    });
  };

  if (!isOpen) return null;

  const totalSelectedFilters = Object.values(localFilters).reduce(
    (sum, filters) => sum + filters.length,
    0
  );

  return (
    <div className="h-full overflow-hidden">
    <div className="h-full flex flex-col">
      <div className="p-4 border-b z-50">
        {!isLoading && collections.length > 0 && (
          <Dropdown options={collections} onSelect={onCollectionSelect} />
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        <CheckboxGroup
          title="Major Primary Site"
          items={getFilterOptions.primarySites()}
          name="primary_sites"
          checkedItems={localFilters.primary_sites}
          onCheckedItemsChange={handleCheckedItemsChange}
          operation={localOperations.primary_sites}
          onOperationChange={handleOperationChange}
          showOperationToggle={false}
        />
        <CheckboxGroup
          title="Disease Types"
          items={getFilterOptions.diseaseTypes()}
          name="disease_types"
          checkedItems={localFilters.disease_types}
          onCheckedItemsChange={handleCheckedItemsChange}
          operation={localOperations.disease_types}
          onOperationChange={handleOperationChange}
          showOperationToggle={false}
        />
        <CheckboxGroup
          title="Data Categories"
          items={getFilterOptions.dataCategories()}
          name="data_categories"
          checkedItems={localFilters.data_categories}
          onCheckedItemsChange={handleCheckedItemsChange}
          operation={localOperations.data_categories}
          onOperationChange={handleOperationChange}
          showOperationToggle={false}
        />
        <CheckboxGroup
          title="Experimental Strategy"
          items={getFilterOptions.expStrategies()}
          name="exp_strategies"
          checkedItems={localFilters.exp_strategies}
          onCheckedItemsChange={handleCheckedItemsChange}
          operation={localOperations.exp_strategies}
          onOperationChange={handleOperationChange}
          showOperationToggle={false}
        />
          {/* Add other CheckboxGroups similarly */}
        </div>
        <div className="p-4 border-t bg-white">
          {totalSelectedFilters > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {totalSelectedFilters} filter{totalSelectedFilters !== 1 ? 's' : ''} selected
            </div>
          )}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanelComponent;