export interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
  dataCount: number;
  percentage: number;
  keywords: string[];
  searchKeyword: string;
}

export interface NonCoveredItem {
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
}