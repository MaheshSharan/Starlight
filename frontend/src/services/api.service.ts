import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse, AppError, ErrorType } from '@/types/api.types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers or request modifications here
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<APIResponse<any>>) => {
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): AppError {
    const timestamp = new Date();

    if (error.response) {
      // Server responded with error status
      return {
        type: ErrorType.API_ERROR,
        message: error.response.data?.error || error.response.statusText || 'API Error',
        code: error.response.status.toString(),
        details: error.response.data,
        timestamp,
      };
    } else if (error.request) {
      // Network error
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error - please check your connection',
        details: error.request,
        timestamp,
      };
    } else {
      // Other error
      return {
        type: ErrorType.API_ERROR,
        message: error.message || 'An unexpected error occurred',
        timestamp,
      };
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<APIResponse<T>>(config);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'API request failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;