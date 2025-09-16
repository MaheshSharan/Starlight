// Backend Service Interfaces

import { 
  Content, 
  ContentDetails, 
  ContentType, 
  TrendingTimeWindow,
  Genre
} from './content.types';
import { 
  SearchResult, 
  SearchParams, 
  SearchFilters, 
  DiscoverParams,
  SearchAnalytics 
} from './search.types';
import { 
  StreamSource, 
  Subtitle, 
  StreamRequest, 
  StreamResponse, 
  PlayerData,
  StreamAnalytics 
} from './streaming.types';

// Content Service Interface
export interface IContentService {
  // Trending content
  getTrending(type: ContentType, timeWindow: TrendingTimeWindow, page?: number): Promise<Content[]>;
  
  // Popular content
  getPopular(type: ContentType, page?: number): Promise<Content[]>;
  
  // Top rated content
  getTopRated(type: ContentType, page?: number): Promise<Content[]>;
  
  // Content details
  getDetails(type: ContentType, id: number): Promise<ContentDetails>;
  
  // Similar content
  getSimilar(type: ContentType, id: number, page?: number): Promise<Content[]>;
  
  // Recommended content
  getRecommendations(type: ContentType, id: number, page?: number): Promise<Content[]>;
  
  // Content discovery
  discover(type: ContentType, params: DiscoverParams): Promise<Content[]>;
  
  // Genres
  getGenres(type: ContentType): Promise<Genre[]>;
  
  // Credits
  getCredits(type: ContentType, id: number): Promise<any>;
}

// Search Service Interface
export interface ISearchService {
  // Multi-search across movies and TV shows
  search(params: SearchParams): Promise<SearchResult>;
  
  // Movie-specific search
  searchMovies(params: SearchParams): Promise<SearchResult>;
  
  // TV show-specific search
  searchTVShows(params: SearchParams): Promise<SearchResult>;
  
  // Advanced search with filters
  advancedSearch(query: string, filters: SearchFilters, page?: number): Promise<SearchResult>;
  
  // Search suggestions/autocomplete
  getSearchSuggestions(query: string, limit?: number): Promise<Content[]>;
  
  // Track search analytics
  trackSearch(analytics: Omit<SearchAnalytics, 'id' | 'created_at'>): Promise<void>;
  
  // Get popular search queries
  getPopularQueries(limit?: number): Promise<string[]>;
}

// Streaming Service Interface
export interface IStreamingService {
  // Get streaming sources for content
  getStreamingSources(request: StreamRequest): Promise<StreamResponse>;
  
  // Get player data (content + sources + subtitles)
  getPlayerData(contentType: ContentType, contentId: number, season?: number, episode?: number): Promise<PlayerData>;
  
  // Validate stream source
  validateStream(source: StreamSource): Promise<boolean>;
  
  // Get available qualities for content
  getAvailableQualities(contentType: ContentType, contentId: number): Promise<string[]>;
  
  // Get subtitles for content
  getSubtitles(contentType: ContentType, contentId: number, season?: number, episode?: number): Promise<Subtitle[]>;
  
  // Track streaming analytics
  trackStream(analytics: Omit<StreamAnalytics, 'id' | 'created_at'>): Promise<void>;
}

// Cache Service Interface
export interface ICacheService {
  // Generic cache operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // Pattern-based operations
  invalidate(pattern: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  
  // Hash operations for complex data
  hget<T>(key: string, field: string): Promise<T | null>;
  hset<T>(key: string, field: string, value: T): Promise<void>;
  hdel(key: string, field: string): Promise<void>;
  hgetall<T>(key: string): Promise<Record<string, T>>;
  
  // List operations
  lpush<T>(key: string, ...values: T[]): Promise<number>;
  rpush<T>(key: string, ...values: T[]): Promise<number>;
  lpop<T>(key: string): Promise<T | null>;
  rpop<T>(key: string): Promise<T | null>;
  lrange<T>(key: string, start: number, stop: number): Promise<T[]>;
  
  // Set operations
  sadd<T>(key: string, ...members: T[]): Promise<number>;
  srem<T>(key: string, ...members: T[]): Promise<number>;
  smembers<T>(key: string): Promise<T[]>;
  sismember<T>(key: string, member: T): Promise<boolean>;
  
  // Expiration
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

// TMDB Service Interface
export interface ITMDBService {
  // Configuration
  getConfiguration(): Promise<any>;
  
  // Trending
  getTrending(mediaType: ContentType, timeWindow: TrendingTimeWindow, page?: number): Promise<any>;
  
  // Popular
  getPopular(mediaType: ContentType, page?: number): Promise<any>;
  
  // Top Rated
  getTopRated(mediaType: ContentType, page?: number): Promise<any>;
  
  // Details
  getDetails(mediaType: ContentType, id: number, appendToResponse?: string): Promise<any>;
  
  // Search
  search(mediaType: ContentType, query: string, page?: number, additionalParams?: Record<string, any>): Promise<any>;
  multiSearch(query: string, page?: number, additionalParams?: Record<string, any>): Promise<any>;
  
  // Discover
  discover(mediaType: ContentType, params: DiscoverParams): Promise<any>;
  
  // Genres
  getGenres(mediaType: ContentType): Promise<any>;
  
  // Credits
  getCredits(mediaType: ContentType, id: number): Promise<any>;
  
  // Similar and Recommendations
  getSimilar(mediaType: ContentType, id: number, page?: number): Promise<any>;
  getRecommendations(mediaType: ContentType, id: number, page?: number): Promise<any>;
  
  // Images
  getImages(mediaType: ContentType, id: number): Promise<any>;
  
  // Videos
  getVideos(mediaType: ContentType, id: number): Promise<any>;
}