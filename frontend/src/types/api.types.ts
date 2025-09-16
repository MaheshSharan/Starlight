// API response format
export interface APIResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
  error?: string;
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  STREAM_ERROR = 'STREAM_ERROR',
  CACHE_ERROR = 'CACHE_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

// API endpoints
export interface ContentEndpoints {
  trending: (type: 'movie' | 'tv', page?: number) => string;
  popular: (type: 'movie' | 'tv', page?: number) => string;
  details: (type: 'movie' | 'tv', id: number) => string;
  search: (query: string, page?: number) => string;
  genres: (type: 'movie' | 'tv') => string;
}

// Request/Response types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}