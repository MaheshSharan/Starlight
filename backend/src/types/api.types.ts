// Standard API Response Format
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    totalPages?: number;
    totalResults?: number;
    limit?: number;
  };
  error?: {
    type: string;
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

// Success Response Helper
export interface SuccessResponse<T = any> extends APIResponse<T> {
  success: true;
  data: T;
}

// Error Response Helper
export interface ErrorResponse extends APIResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code?: string;
    details?: any;
  };
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Common Error Types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

// Request with additional properties
export interface ExtendedRequest extends Request {
  requestId?: string;
}