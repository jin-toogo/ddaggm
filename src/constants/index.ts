// Pagination constants
export const ITEMS_PER_PAGE = 20;

// API constants
export const API_ENDPOINTS = {
  HOSPITALS: "/api/hospitals",
  NONPAYMENT: "/api/nonpayment",
  NEARBY: "/api/hospitals/nearby",
} as const;

// Default values
export const DEFAULT_LOCATION = "all";
export const DEFAULT_TREATMENT = "all";

export const SEARCH_DEBOUNCE_MS = 300;
