import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCollections, Collection } from '../../api/index.ts';

interface CheckboxGroupProps {
  title: string;
  items: string[];
  name: string;
}

interface DropdownProps {
  options: Collection[];
  onSelect: (selected: string) => void;
}
interface FilterPanelComponentProps {
  isOpen: boolean;
  onCollectionSelect: (collection: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
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

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, items, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>(items);

  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setCheckedItems(items);
    } else {
      setCheckedItems([]);
    }
  };

  const handleToggle = (item: string) => {
    setCheckedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="mb-4">
      <button
        className="flex justify-between items-center w-full p-2 bg-gray-100 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-2 p-2 bg-white border rounded-md max-h-48 overflow-y-auto">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={checkedItems.length === items.length}
              onChange={handleToggleAll}
            />
            <span className="ml-2">Check All</span>
          </label>
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
      )}
    </div>
  );
};


const FilterPanelComponent: React.FC<FilterPanelComponentProps> = ({ isOpen, onCollectionSelect }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching collections...');
        const data = await getCollections();
        console.log('Fetched collections:', data);
        setCollections(data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
        setError('Failed to load collections. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (!isOpen) {
    return null;
  }

  const primarySites = [
    "Adrenal Gland", "Bile Duct", "Bladder", "Bone", "Bone Marrow", "Brain", "Breast",
    "Cervix", "Colorectal", "Esophagus", "Eye", "Head and Neck", "Kidney", "Liver",
    "Lung", "Lymph Nodes", "Nervous System", "Ovary", "Pancreas", "Pleura", "Prostate",
    "Skin", "Soft Tissue", "Stomach", "Testis", "Thymus", "Thyroid", "Uterus"
  ];

  const expStrategies = ["WXS", "RNA-Seq", "miRNA-Seq", "Genotyping Array", "Methylation Array"];

  const clinicalFilters = ["PatientID", "PatientAge", "PatientWeight"];

  const metadataFilters = [
    "Tumor Location", "Modality", "Collection ID", "Image Type", "Manufacturer",
    "Manufacturer Model Name", "StudyDate", "Study Description", "Series Description",
    "Slice Thickness", "Pixel Spacing"
  ];

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0'}`}>
    <div className="h-full bg-white border rounded-b-lg shadow-lg p-4 overflow-y-auto">
      {!isLoading && collections.length > 0 && (
        <Dropdown
          options={collections}
          onSelect={onCollectionSelect}
        />
      )}
        <CheckboxGroup title="Major Primary Site" items={primarySites} name="primary_sites" />
        <CheckboxGroup title="Experimental Strategy" items={expStrategies} name="exp_strategies" />
        <CheckboxGroup title="Clinical" items={clinicalFilters} name="clinical_filters" />
        <CheckboxGroup title="Metadata" items={metadataFilters} name="metadata_filters" />
      </div>
    </div>
  );
};

export default FilterPanelComponent;