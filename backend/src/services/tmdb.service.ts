import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '@/config/index.js';
import { 
  ITMDBService,
  ICacheService 
} from '@/types/service.interfaces.js';
import { 
  ContentType, 
  TrendingTimeWindow,
  TMDBResponse 
} from '@/types/content.types.js';
import { DiscoverParams } from '@/types/search.types.js';

/**
 * TMDB API Service with authentication, rate limiting, and error handling
 */
export class TMDBService implements ITMDBService {
  private client: AxiosInstance;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 250; // 4 requests per second max
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // Base delay for exponential backoff

  constructor(private cacheService?: ICacheService) {
    this.client = axios.create({
      baseURL: config.tmdb.baseUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${config.tmdb.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Starlight-Streaming-Platform/1.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        await this.enforceRateLimit();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle rate limiting (429) with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retry) {
          originalRequest._retry = true;
          const retryAfter = error.response.headers['retry-after'] || 1;
          await this.delay(retryAfter * 1000);
          return this.client(originalRequest);
        }

        // Handle server errors with retry logic
        if (this.shouldRetry(error) && !originalRequest._retryCount) {
          return this.retryRequest(originalRequest, error);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }  /*
*
   * Enforce rate limiting to respect TMDB API limits
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.delay(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(originalRequest: any, error: any): Promise<any> {
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
    
    if (originalRequest._retryCount > this.maxRetries) {
      throw this.formatError(error);
    }

    const delay = this.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
    await this.delay(delay);
    
    return this.client(originalRequest);
  }

  /**
   * Format error for consistent error handling
   */
  private formatError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      return new Error(`TMDB API Error ${status}: ${data?.status_message || error.message}`);
    } else if (error.request) {
      return new Error('TMDB API Network Error: No response received');
    } else {
      return new Error(`TMDB API Request Error: ${error.message}`);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make authenticated request to TMDB API
   */
  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`TMDB API request failed for ${endpoint}:`, error);
      throw error;
    }
  }  //TMDBService Implementation

  /**
   * Get TMDB API configuration
   */
  async getConfiguration(): Promise<any> {
    return this.makeRequest('/configuration');
  }

  /**
   * Get trending content
   */
  async getTrending(
    mediaType: ContentType, 
    timeWindow: TrendingTimeWindow, 
    page: number = 1
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/trending/${mediaType}/${timeWindow}`, { page });
  }

  /**
   * Get popular content
   */
  async getPopular(
    mediaType: ContentType, 
    page: number = 1
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/${mediaType}/popular`, { page });
  }

  /**
   * Get top rated content
   */
  async getTopRated(
    mediaType: ContentType, 
    page: number = 1
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/${mediaType}/top_rated`, { page });
  }

  /**
   * Get content details with optional additional data
   */
  async getDetails(
    mediaType: ContentType, 
    id: number, 
    appendToResponse?: string
  ): Promise<any> {
    const params: Record<string, any> = {};
    if (appendToResponse) {
      params.append_to_response = appendToResponse;
    }
    
    return this.makeRequest(`/${mediaType}/${id}`, params);
  }

  /**
   * Search content by type
   */
  async search(
    mediaType: ContentType, 
    query: string, 
    page: number = 1, 
    additionalParams: Record<string, any> = {}
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/search/${mediaType}`, {
      query,
      page,
      ...additionalParams
    });
  }  /*
*
   * Multi-search across all content types
   */
  async multiSearch(
    query: string, 
    page: number = 1, 
    additionalParams: Record<string, any> = {}
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest('/search/multi', {
      query,
      page,
      ...additionalParams
    });
  }

  /**
   * Discover content with filters
   */
  async discover(
    mediaType: ContentType, 
    params: DiscoverParams
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/discover/${mediaType}`, params);
  }

  /**
   * Get genres for content type
   */
  async getGenres(mediaType: ContentType): Promise<any> {
    return this.makeRequest(`/genre/${mediaType}/list`);
  }

  /**
   * Get credits for content
   */
  async getCredits(mediaType: ContentType, id: number): Promise<any> {
    return this.makeRequest(`/${mediaType}/${id}/credits`);
  }

  /**
   * Get similar content
   */
  async getSimilar(
    mediaType: ContentType, 
    id: number, 
    page: number = 1
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/${mediaType}/${id}/similar`, { page });
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(
    mediaType: ContentType, 
    id: number, 
    page: number = 1
  ): Promise<TMDBResponse<any>> {
    return this.makeRequest(`/${mediaType}/${id}/recommendations`, { page });
  }

  /**
   * Get images for content
   */
  async getImages(mediaType: ContentType, id: number): Promise<any> {
    return this.makeRequest(`/${mediaType}/${id}/images`);
  }

  /**
   * Get videos for content
   */
  async getVideos(mediaType: ContentType, id: number): Promise<any> {
    return this.makeRequest(`/${mediaType}/${id}/videos`);
  }
}