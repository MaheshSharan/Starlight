// Repository Interfaces for Data Access Patterns

import { 
  Content, 
  ContentDetails, 
  ContentType 
} from './content.types';
import { 
  SearchResult, 
  SearchFilters, 
  SearchAnalytics 
} from './search.types';
import { 
  StreamCacheEntry, 
  StreamAnalytics 
} from './streaming.types';

// Base Repository Interface
export interface IBaseRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(limit?: number, offset?: number): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  exists(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

// Content Repository Interface
export interface IContentRepository {
  // Find operations
  findTrending(type: ContentType, page: number, limit: number): Promise<Content[]>;
  findPopular(type: ContentType, page: number, limit: number): Promise<Content[]>;
  findTopRated(type: ContentType, page: number, limit: number): Promise<Content[]>;
  findById(id: number, type: ContentType): Promise<ContentDetails | null>;
  findByIds(ids: number[], type: ContentType): Promise<Content[]>;
  
  // Search operations
  findBySearch(query: string, filters: SearchFilters, page: number, limit: number): Promise<SearchResult>;
  findSimilar(id: number, type: ContentType, page: number, limit: number): Promise<Content[]>;
  findRecommendations(id: number, type: ContentType, page: number, limit: number): Promise<Content[]>;
  
  // Cache operations
  cacheContent(content: ContentDetails): Promise<void>;
  getCachedContent(id: number, type: ContentType): Promise<ContentDetails | null>;
  invalidateContentCache(id: number, type: ContentType): Promise<void>;
  
  // Popularity tracking
  incrementViewCount(id: number, type: ContentType): Promise<void>;
  getPopularContent(type: ContentType, limit: number): Promise<Content[]>;
  
  // Batch operations
  batchCache(contents: ContentDetails[]): Promise<void>;
  batchInvalidate(ids: Array<{ id: number; type: ContentType }>): Promise<void>;
}

// Search Analytics Repository Interface
export interface ISearchAnalyticsRepository extends IBaseRepository<SearchAnalytics> {
  // Search tracking
  trackSearch(query: string, filters: SearchFilters, resultsCount: number): Promise<void>;
  
  // Analytics queries
  getPopularQueries(limit: number, timeframe?: Date): Promise<Array<{ query: string; count: number }>>;
  getSearchTrends(timeframe: Date): Promise<Array<{ query: string; count: number; date: Date }>>;
  getFilterUsage(): Promise<Array<{ filter: string; count: number }>>;
  
  // Cleanup operations
  cleanupOldEntries(olderThan: Date): Promise<number>;
}

// Stream Cache Repository Interface
export interface IStreamCacheRepository extends IBaseRepository<StreamCacheEntry> {
  // Stream cache operations
  findByContent(contentId: number, contentType: ContentType, season?: number, episode?: number): Promise<StreamCacheEntry | null>;
  cacheStream(entry: Omit<StreamCacheEntry, 'id'>): Promise<StreamCacheEntry>;
  invalidateExpired(): Promise<number>;
  
  // Provider-specific operations
  findByProvider(provider: string, limit?: number): Promise<StreamCacheEntry[]>;
  invalidateByProvider(provider: string): Promise<number>;
  
  // Content-specific operations
  invalidateByContent(contentId: number, contentType: ContentType): Promise<number>;
  
  // Batch operations
  batchCache(entries: Array<Omit<StreamCacheEntry, 'id'>>): Promise<StreamCacheEntry[]>;
  batchInvalidate(contentIds: Array<{ contentId: number; contentType: ContentType }>): Promise<number>;
}

// Stream Analytics Repository Interface
export interface IStreamAnalyticsRepository extends IBaseRepository<StreamAnalytics> {
  // Stream tracking
  trackStream(analytics: Omit<StreamAnalytics, 'id' | 'created_at'>): Promise<void>;
  
  // Analytics queries
  getPopularContent(limit: number, timeframe?: Date): Promise<Array<{ contentId: number; contentType: ContentType; count: number }>>;
  getProviderStats(timeframe?: Date): Promise<Array<{ provider: string; successRate: number; avgResponseTime: number }>>;
  getQualityStats(timeframe?: Date): Promise<Array<{ quality: string; count: number }>>;
  getErrorStats(timeframe?: Date): Promise<Array<{ error: string; count: number }>>;
  
  // Performance metrics
  getAverageResponseTime(provider?: string, timeframe?: Date): Promise<number>;
  getSuccessRate(provider?: string, timeframe?: Date): Promise<number>;
  
  // Cleanup operations
  cleanupOldEntries(olderThan: Date): Promise<number>;
}

// Cache Repository Interface (for Redis operations)
export interface ICacheRepository {
  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  deletePattern(pattern: string): Promise<number>;
  
  // Hash operations
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
  llen(key: string): Promise<number>;
  
  // Set operations
  sadd<T>(key: string, ...members: T[]): Promise<number>;
  srem<T>(key: string, ...members: T[]): Promise<number>;
  smembers<T>(key: string): Promise<T[]>;
  sismember<T>(key: string, member: T): Promise<boolean>;
  scard(key: string): Promise<number>;
  
  // Sorted set operations
  zadd(key: string, score: number, member: string): Promise<number>;
  zrem(key: string, member: string): Promise<number>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  zscore(key: string, member: string): Promise<number | null>;
  
  // Expiration
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  
  // Connection
  ping(): Promise<string>;
  flushdb(): Promise<void>;
}

// Generic Repository Factory Interface
export interface IRepositoryFactory {
  getContentRepository(): IContentRepository;
  getSearchAnalyticsRepository(): ISearchAnalyticsRepository;
  getStreamCacheRepository(): IStreamCacheRepository;
  getStreamAnalyticsRepository(): IStreamAnalyticsRepository;
  getCacheRepository(): ICacheRepository;
}