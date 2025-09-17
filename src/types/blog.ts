export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  originalUrl: string;
  publishedAt: string;
  author: string;
  clinicName?: string;
  clinicAddress?: string;
  hospitalId?: number;
  notes?: string;
  isMatched: boolean;
  categories: string[];
  tags: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  hospital?: {
    id: number;
    name: string;
    address: string;
    province: string;
    district: string;
  };
}

export interface BlogCsvRow {
  blog_url: string;
  clinic_name?: string;
  clinic_address?: string;
  category?: string;
  notes?: string;
}

export interface BlogReviewsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CsvProcessResult {
  totalRows: number;
  processed: number;
  matched: number;
  unmatchedCount: number;
  errors: string[];
}