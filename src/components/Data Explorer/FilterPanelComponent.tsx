import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCollections, Collection } from '../../api/index.ts';

interface CheckboxGroupProps {
  title: string;
  items: string[];
  name: string;
  checkedItems: string[];
  onCheckedItemsChange: (name: string, items: string[]) => void;
  operation?: 'and' | 'or';  // Make operation optional
  onOperationChange?: (name: string, operation: 'and' | 'or') => void;  // Make operation change optional
  showOperationToggle?: boolean;  // Add flag to control toggle visibility
}

interface DropdownProps {
  options: Collection[];
  onSelect: (selected: string) => void;
}


interface FilterState {
  filters: Record<string, string[]>;
  operations: Record<string, 'and' | 'or'>;
}

interface FilterPanelComponentProps {
  isOpen: boolean;
  onCollectionSelect: (collection: string) => void;
  onFiltersChange: (filterState: FilterState) => void;
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

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
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
    if (event.target.checked) {
      onCheckedItemsChange(name, items);
    } else {
      onCheckedItemsChange(name, []);
    }
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

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCollections();
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

  // Add handler for applying filters
  const handleApplyFilters = () => {
    onFiltersChange({
      filters: localFilters,
      operations: localOperations,
    });
  };

  // Add handler for resetting filters
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
  
  if (!isOpen) {
    return null;
  }
  const totalSelectedFilters = Object.values(localFilters).reduce(
    (sum, filters) => sum + filters.length,
    0
  );

  const primarySites = [
    "accessory sinuses",
    "adrenal gland",
    "anus and anal canal",
    "base of tongue",
    "bladder",
    "bones, joints and articular cartilage of limbs",
    "bones, joints and articular cartilage of other and unspecified sites",
    "brain",
    "breast",
    "bronchus and lung",
    "cervix uteri",
    "colon",
    "connective, subcutaneous and other soft tissues",
    "corpus uteri",
    "esophagus",
    "eye and adnexa",
    "floor of mouth",
    "gallbladder",
    "gum",
    "heart, mediastinum, and pleura",
    "hematopoietic and reticuloendothelial systems",
    "hypopharynx",
    "kidney",
    "larynx",
    "lip",
    "liver and intrahepatic bile ducts",
    "lymph nodes",
    "meninges",
    "nasal cavity and middle ear",
    "nasopharynx",
    "not reported",
    "oropharynx",
    "other and ill-defined digestive organs",
    "other and ill-defined sites",
    "other and ill-defined sites in lip, oral cavity and pharynx",
    "other and ill-defined sites within respiratory system and intrathoracic organs",
    "other and unspecified female genital organs",
    "other and unspecified major salivary glands",
    "other and unspecified male genital organs",
    "other and unspecified parts of biliary tract",
    "other and unspecified parts of mouth",
    "other and unspecified parts of tongue",
    "other and unspecified urinary organs",
    "other endocrine glands and related structures",
    "ovary",
    "palate",
    "pancreas",
    "parotid gland",
    "penis",
    "peripheral nerves and autonomic nervous system",
    "prostate gland",
    "rectosigmoid junction",
    "rectum",
    "renal pelvis",
    "retroperitoneum and peritoneum",
    "skin",
    "small intestine",
    "spinal cord, cranial nerves, and other parts of central nervous system",
    "stomach",
    "testis",
    "thymus",
    "thyroid gland",
    "tonsil",
    "trachea",
    "unknown",
    "ureter",
    "uterus, nos",
    "vagina",
    "vulva"
  ];

  const expStrategies = [
    "ATAC-Seq",
    "Diagnostic Slide",
    "Expression Array",
    "Genotyping Array",
    "Methylation Array",
    "miRNA-Seq",
    "Reverse Phase Protein Array",
    "RNA-Seq",
    "scRNA-Seq",
    "Targeted Sequencing",
    "Tissue Slide",
    "WGS",
    "WXS"
  ];

  const clinicalFilters = ["PatientID", "PatientAge", "PatientWeight"];
  const diagnosis = [
    "acinar adenocarcinoma",
    "acinar cell carcinoma",
    "acinar cell tumor",
    "acute erythroid leukaemia",
    "acute leukemia, nos",
    "acute lymphoblastic leukemia, nos",
    "acute lymphocytic leukemia",
    "acute monoblastic and monocytic leukemia",
    "acute myeloid leukemia with inv(3)(q21q26.2) or t(3;3)(q21;q26.2); rpn1-evi1",
    "acute myeloid leukemia with maturation",
    "acute myeloid leukemia with mutated cebpa",
    "acute myeloid leukemia with mutated npm1",
    "acute myeloid leukemia with myelodysplasia-related changes",
    "acute myeloid leukemia with t(6;9)(p23;q34); dek-nup214",
    "acute myeloid leukemia with t(8;21)(q22;q22); runx1-runx1t1",
    "acute myeloid leukemia with t(9;11)(p22;q23); mllt3-mll",
    "acute myeloid leukemia without maturation",
    "acute myeloid leukemia, cbf-beta/myh11",
    "acute myeloid leukemia, minimal differentiation",
    "acute myeloid leukemia, nos",
    "acute myelomonocytic leukemia",
    "acute promyelocytic leukaemia, pml-rar-alpha",
    "adenocarcinoma in tubolovillous adenoma",
    "adenocarcinoma with mixed subtypes",
    "adenocarcinoma, diffuse type",
    "adenocarcinoma, endocervical type",
    "adenocarcinoma, intestinal type",
    "adenocarcinoma, metastatic, nos",
    "adenocarcinoma, nos",
    "adenoid cystic carcinoma",
    "adenosquamous carcinoma",
    "adnexal carcinoma",
    "adrenal cortical carcinoma",
    "amelanotic melanoma",
    "angiosarcoma",
    "astrocytoma, anaplastic",
    "astrocytoma, nos",
    "atypical carcinoid tumor",
    "atypical chronic myeloid leukemia, bcr/abl negative",
    "basal cell carcinoma, nos",
    "basaloid carcinoma",
    "basaloid squamous cell carcinoma",
    "bronchio-alveolar carcinoma, mucinous",
    "bronchiolo-alveolar carcinoma, non-mucinous",
    "burkitt lymphoma, nos (includes all variants)",
    "burkitt-like lymphoma",
    "carcinoid tumor, nos",
    "carcinoma, anaplastic, nos",
    "carcinoma, diffuse type",
    "carcinoma, nos",
    "carcinoma, undifferentiated, nos",
    "carcinosarcoma, nos",
    "cholangiocarcinoma",
    "chordoma, nos",
    "chronic myelomonocytic leukemia, nos",
    "chronic neutrophilic leukemia",
    "clear cell adenocarcinoma, nos",
    "clear cell carcinoma",
    "clear cell sarcoma of kidney",
    "collecting duct carcinoma",
    "combined hepatocellular carcinoma and cholangiocarcinoma",
    "common precursor b all",
    "dedifferentiated liposarcoma",
    "diffuse large b-cell lymphoma, nos",
    "duct adenocarcinoma, nos",
    "duct carcinoma, nos",
    "ductal carcinoma in situ, nos",
    "embryonal carcinoma, nos",
    "endometrioid adenocarcinoma, nos",
    "ependymoma, nos",
    "epithelial tumor, malignant",
    "epithelioid cell melanoma",
    "epithelioid mesothelioma, malignant",
    "esthesioneuroblastoma",
    "extra-adrenal paraganglioma, malignant",
    "extra-adrenal paraganglioma, nos",
    "fibromyxosarcoma",
    "follicular carcinoma, nos",
    "ganglioneuroblastoma",
    "gastrointestinal stromal tumor, nos",
    "germ cell tumor, nos",
    "glioblastoma",
    "glioblastoma multiforme",
    "glioma, malignant",
    "granulosa cell tumor, nos",
    "hepatocellular carcinoma, clear cell type",
    "hepatocellular carcinoma, nos",
    "infiltrating duct and lobular carcinoma",
    "infiltrating duct carcinoma, nos",
    "infiltrating duct mixed with other types of carcinoma",
    "infiltrating lobular carcinoma, nos",
    "infiltrating lobular mixed with other types of carcinoma",
    "inflammatory carcinoma",
    "intraductal micropapillary carcinoma",
    "intraductal papillary adenocarcinoma with invasion",
    "invasive mammary carcinoma",
    "invasive mucinous adenocarcinoma",
    "large cell carcinoma, nos",
    "large cell neuroendocrine carcinoma",
    "leiomyosarcoma, nos",
    "lepidic adenocarcinoma",
    "leukemia, nos",
    "lobular carcinoma, nos",
    "malignant fibrous histiocytoma",
    "malignant lymphoma, large b-cell, diffuse, nos",
    "malignant melanoma, nos",
    "malignant peripheral nerve sheath tumor",
    "malignant rhabdoid tumor",
    "medullary carcinoma, nos",
    "medulloblastoma, nos",
    "melanoma, nos",
    "meningioma, nos",
    "merkel cell carcinoma",
    "mesothelioma, biphasic, malignant",
    "mesothelioma, malignant",
    "mesothelioma, nos",
    "metaplastic carcinoma, nos",
    "mixed epithelioid and spindle cell melanoma",
    "mixed germ cell tumor",
    "mixed glioma",
    "mixed phenotype acute leukemia, t/myeloid, nos",
    "mucinous adenocarcinoma",
    "mucinous adenocarcinoma, endocervical type",
    "mucinous carcinoma",
    "mucoepidermoid carcinoma",
    "mullerian mixed tumor",
    "multiple myeloma",
    "myelodysplastic syndrome, unclassifiable",
    "myelodysplastic/myeloproliferative neoplasm, unclassifiable",
    "myeloid sarcoma",
    "myloproliferative neoplasm, unclassifiable",
    "myoepithelial carcinoma",
    "neoplasm, malignant",
    "neoplasm, nos",
    "nephroblastoma, nos",
    "neuroblastoma, nos",
    "neuroendocrine carcinoma, nos",
    "nodular melanoma",
    "non-small cell carcinoma",
    "nonencapsulated sclerosing carcinoma",
    "not reported",
    "oligodendroglioma, anaplastic",
    "oligodendroglioma, nos",
    "oncocytoma",
    "osteosarcoma, nos",
    "papillary adenocarcinoma, nos",
    "papillary carcinoma, columnar cell",
    "papillary carcinoma, follicular variant",
    "papillary carcinoma, nos",
    "papillary renal cell carcinoma",
    "papillary serous adenocarcinoma",
    "papillary serous cystadenocarcinoma",
    "papillary squamous cell carcinoma",
    "papillary transitional cell carcinoma",
    "paraganglioma, nos",
    "pheochromocytoma, malignant",
    "pheochromocytoma, nos",
    "pituitary adenoma, nos",
    "precursor b-cell lymphoblastic leukemia",
    "precursor cell lymphoblastic leukemia, nos",
    "precursor cell lymphoblastic leukemia, not phenotyped",
    "renal cell carcinoma, chromophobe type",
    "renal cell carcinoma, nos",
    "sarcomatoid carcinoma",
    "seminoma, nos",
    "serous adenocarcinoma, nos",
    "serous carcinoma, nos",
    "serous cystadenocarcinoma, nos",
    "sex cord tumor, nos",
    "signet ring cell carcinoma",
    "small cell carcinoma, nos",
    "solid carcinoma, nos",
    "solid pseudopapillary tumor",
    "spindle cell carcinoma, nos",
    "spindle cell melanoma, nos",
    "spindle cell melanoma, type b",
    "squamous cell carcinoma, keratinizing, nos",
    "squamous cell carcinoma, large cell, nonkeratinizing, nos",
    "squamous cell carcinoma, nonkeratinizing, nos",
    "squamous cell carcinoma, nos",
    "superficial spreading melanoma",
    "synovial sarcoma, spindle cell",
    "teratoma, benign",
    "therapy related myeloid neoplasm",
    "thymic carcinoma, nos",
    "thymoma, nos",
    "thymoma, type a, malignant",
    "thymoma, type ab, malignant",
    "thymoma, type ab, nos",
    "thymoma, type b1, malignant",
    "thymoma, type b2, malignant",
    "thymoma, type b2, nos",
    "thymoma, type b3, malignant",
    "transitional cell carcinoma",
    "tubular adenocarcinoma",
    "tumor, nos",
    "undifferentiated sarcoma",
    "unknown",
    "urothelial carcinoma, nos",
    "wilms tumor"
  ];
  const diseaseTypes = [
    "acinar cell neoplasms",
    "acute lymphoblastic leukemia",
    "adenomas and adenocarcinomas",
    "adnexal and skin appendage neoplasms",
    "basal cell neoplasms",
    "blood vessel tumors",
    "chronic myeloproliferative disorders",
    "complex epithelial neoplasms",
    "complex mixed and stromal neoplasms",
    "cystic, mucinous and serous neoplasms",
    "ductal and lobular neoplasms",
    "epithelial neoplasms, nos",
    "fibroepithelial neoplasms",
    "fibromatous neoplasms",
    "germ cell neoplasms",
    "gliomas",
    "leukemias, nos",
    "lipomatous neoplasms",
    "lymphoid leukemias",
    "mature b-cell lymphomas",
    "mature t- and nk-cell lymphomas",
    "meningiomas",
    "mesothelial neoplasms",
    "miscellaneous bone tumors",
    "miscellaneous tumors",
    "mucoepidermoid neoplasms",
    "myelodysplastic syndromes",
    "myeloid leukemias",
    "myomatous neoplasms",
    "neoplasms, nos",
    "nerve sheath tumors",
    "neuroepitheliomatous neoplasms",
    "nevi and melanomas",
    "not applicable",
    "not reported",
    "osseous and chondromatous neoplasms",
    "paragangliomas and glomus tumors",
    "plasma cell tumors",
    "soft tissue tumors and sarcomas, nos",
    "specialized gonadal neoplasms",
    "squamous cell neoplasms",
    "synovial-like neoplasms",
    "thymic epithelial neoplasms",
    "transitional cell papillomas and carcinomas",
    "unknown"
  ];
  const metadataFilters = [
    "Tumor Location", "Modality", "Collection ID", "Image Type", "Manufacturer",
    "Manufacturer Model Name", "StudyDate", "Study Description", "Series Description"
  ];
  const dataCategories = [
    "biospecimen",
    "clinical",
    "combined nucleotide variation",
    "copy number variation",
    "dna methylation",
    "proteome profiling",
    "sequencing reads",
    "simple nucleotide variation",
    "somatic structural variation",
    "structural variation",
    "transcriptome profiling"
  ];
  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b z-50">
          {!isLoading && collections.length > 0 && (
            <Dropdown
              options={collections}
              onSelect={onCollectionSelect}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <CheckboxGroup
            title="Major Primary Site"
            items={primarySites}
            name="primary_sites"
            checkedItems={localFilters.primary_sites}
            onCheckedItemsChange={handleCheckedItemsChange}
            operation={localOperations.primary_sites}
            onOperationChange={handleOperationChange}
            showOperationToggle={false}
          />
          <CheckboxGroup
            title="Disease Types"
            items={diseaseTypes}
            name="disease_types"
            checkedItems={localFilters.disease_types}
            onCheckedItemsChange={handleCheckedItemsChange}
            operation={localOperations.disease_types}
            onOperationChange={handleOperationChange}
            showOperationToggle={false}
          />
          <CheckboxGroup
            title="Data Categories"
            items={dataCategories}
            name="data_categories"
            checkedItems={localFilters.data_categories}
            onCheckedItemsChange={handleCheckedItemsChange}
            operation={localOperations.data_categories}
            onOperationChange={handleOperationChange}
            showOperationToggle={false}
          />
          <CheckboxGroup
            title="Experimental Strategy"
            items={expStrategies}
            name="exp_strategies"
            checkedItems={localFilters.exp_strategies}
            onCheckedItemsChange={handleCheckedItemsChange}
            operation={localOperations.exp_strategies}
            onOperationChange={handleOperationChange}
            showOperationToggle={false}
          />
        </div>
        {/* Fixed button container at the bottom */}
        <div className="p-4 border-t bg-white">
          {totalSelectedFilters > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {totalSelectedFilters} filter{totalSelectedFilters !== 1 ? 's' : ''} selected
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleResetFilters}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Reset
            </button>
            <button
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
        /* <CheckboxGroup
          title="Clinical"
          items={clinicalFilters}
          name="clinical_filters"
          checkedItems={filters.clinical_filters}
          onCheckedItemsChange={handleCheckedItemsChange}
        />
        <CheckboxGroup
          title="Metadata"
          items={metadataFilters}
          name="metadata_filters"
          checkedItems={filters.metadata_filters}
          onCheckedItemsChange={handleCheckedItemsChange}
        /> */
    

export default FilterPanelComponent;
