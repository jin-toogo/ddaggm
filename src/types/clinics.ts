export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  city_kor: string;
  district: string;
  district_kor: string;
  phone?: string;
  insurance?: boolean;
  status?: string;
}

export interface ClinicSearchFilters {
  city: string;
  district: string;
  searchQuery: string;
}
