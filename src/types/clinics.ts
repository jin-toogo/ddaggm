export interface Clinic {
  id: number;
  name: string;
  address: string;
  province: string;
  district: string;
  phone: string;
  insurance: boolean;
  type: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
  clinicCategories: {
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
}

export interface ClinicSearchFilters {
  city: string;
  district: string;
  searchQuery: string;
}
