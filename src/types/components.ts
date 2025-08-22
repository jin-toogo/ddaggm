import { Clinic } from './clinics';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onClear?: () => void;
  placeholder?: string;
}

export interface StatusBadgeProps {
  status: "confirmed" | "unknown";
}

export interface ClinicListItemProps {
  clinic: Clinic;
}

export interface ClinicListProps {
  clinics: Clinic[];
  isLoading: boolean;
  searchQuery: string;
}

export interface FilterDropdownsProps {
  selectedCity: string;
  selectedDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  totalCount: number;
  cities: string[];
  districts: string[];
}

export interface TreatmentFiltersProps {
  categories: {
    id: string;
    name: string;
    description: string;
    dataCount: number;
    percentage: number;
    keywords: string[];
  }[];
  selectedTreatment: string;
  onTreatmentChange: (treatment: string) => void;
  totalCount: number;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
}

export interface NonCoveredListProps {
  items: {
    id: number;
    treatmentName: string;
    category: string;
    amount: number;
    clinicName: string;
    npayCode: string;
    yadmNm: string;
    hospitalId: number;
    province: string;
    district: string;
  }[];
  isLoading: boolean;
  searchQuery: string;
  selectedTreatment: string;
  treatmentCategories: {
    id: string;
    name: string;
    description: string;
    dataCount: number;
    percentage: number;
    keywords: string[];
  }[];
}

export interface NonPaymentItemsProps {
  items: {
    id: number;
    npayCode: string | null;
    category: string | null;
    treatmentName: string | null;
    amount: number | null;
    yadmNm: string | null;
  }[];
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownFilterProps {
  label: string;
  selectedValue: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
  showDevelopmentTooltip?: boolean;
  width?: string;
}