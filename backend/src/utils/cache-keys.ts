import { config } from '@/config/index.js';

/**
 * Cache key patterns for consistent key generation
 */
export const CACHE_KEYS = {
  // Content Discovery
  TRENDING_MOVIES: (page: number) => `trending:movies:page:${page}`,
  TRENDING_TV: (page: number) => `trending:tv:page:${page}`,
  POPULAR_MOVIES: (page: number) => `popular:movies:page:${page}`,
  POPULAR_TV: (page: number) => `popular:tv:page:${page}`,
  TOP_RATED_MOVIES: (page: number) => `top-rated:movies:page:${page}`,
  TOP_RATED_TV: (page: number) => `top-rated:tv:page:${page}`,

  // Content Details
  CONTENT_DETAILS: (type: 'movie' | 'tv', id: number) => `content:${type}:${id}`,
  CONTENT_CREDITS: (type: 'movie' | 'tv', id: number) => `credits:${type}:${id}`,
  CONTENT_SIMILAR: (type: 'movie' | 'tv', id: number) => `similar:${type}:${id}`,
  CONTENT_RECOMMENDATIONS: (type: 'movie' | 'tv', id: number) => `recommendations:${type}:${id}`,

  // Search
  SEARCH_RESULTS: (query: string, filtersHash: string, page: number) => 
    `search:${encodeURIComponent(query)}:${filtersHash}:page:${page}`,
  SEARCH_SUGGESTIONS: (query: string) => `search:suggestions:${encodeURIComponent(query)}`,

  // Streaming
  STREAM_SOURCES: (type: 'movie' | 'tv', id: number) => `streams:${type}:${id}`,
  STREAM_PROVIDERS: () => 'stream:providers',

  // Metadata
  GENRES: (type: 'movie' | 'tv') => `genres:${type}`,
  COUNTRIES: () => 'countries',
  LANGUAGES: () => 'languages',

  // Analytics
  POPULAR_SEARCHES: () => 'analytics:popular-searches',
  TRENDING_SEARCHES: () => 'analytics:trending-searches',

  // System
  API_STATUS: () => 'system:api-status',
  HEALTH_CHECK: () => 'system:health',
} as const;

/**
 * Cache TTL (Time To Live) configurations in seconds
 */
export const CACHE_TTL = {
  // Content Discovery - shorter TTL for frequently changing data
  TRENDING: config.cache.ttl.trending,           // 1 hour
  POPULAR: config.cache.ttl.popular,            // 2 hours
  TOP_RATED: 14400,                             // 4 hours (more stable)

  // Content Details - longer TTL for stable data
  CONTENT_DETAILS: config.cache.ttl.contentDetails, // 24 hours
  CONTENT_CREDITS: 86400,                           // 24 hours
  CONTENT_SIMILAR: 43200,                           // 12 hours
  CONTENT_RECOMMENDATIONS: 43200,                   // 12 hours

  // Search - medium TTL
  SEARCH_RESULTS: config.cache.ttl.searchResults,  // 30 minutes
  SEARCH_SUGGESTIONS: 1800,                         // 30 minutes

  // Streaming - short TTL for dynamic content
  STREAM_SOURCES: config.cache.ttl.streamSources,  // 5 minutes
  STREAM_PROVIDERS: 3600,                           // 1 hour

  // Metadata - very long TTL for rarely changing data
  GENRES: config.cache.ttl.genres,                 // 1 week
  COUNTRIES: 604800,                                // 1 week
  LANGUAGES: 604800,                                // 1 week

  // Analytics - medium TTL
  POPULAR_SEARCHES: 3600,                           // 1 hour
  TRENDING_SEARCHES: 1800,                          // 30 minutes

  // System - short TTL for monitoring
  API_STATUS: 300,                                  // 5 minutes
  HEALTH_CHECK: 60,                                 // 1 minute
} as const;

/**
 * Cache invalidation patterns
 */
export const CACHE_PATTERNS = {
  // Invalidate all content of a specific type
  ALL_CONTENT: (type: 'movie' | 'tv') => `*:${type}:*`,
  
  // Invalidate all trending content
  ALL_TRENDING: () => 'trending:*',
  
  // Invalidate all popular content
  ALL_POPULAR: () => 'popular:*',
  
  // Invalidate all search results
  ALL_SEARCH: () => 'search:*',
  
  // Invalidate specific content and related data
  CONTENT_AND_RELATED: (type: 'movie' | 'tv', id: number) => `*:${type}:${id}*`,
  
  // Invalidate all streaming data
  ALL_STREAMS: () => 'streams:*',
  
  // Invalidate all analytics
  ALL_ANALYTICS: () => 'analytics:*',
} as const;

/**
 * Utility functions for cache key management
 */
export class CacheKeyUtils {
  /**
   * Generate hash for search filters to create consistent cache keys
   */
  static hashFilters(filters: Record<string, any>): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {} as Record<string, any>);
    
    return Buffer.from(JSON.stringify(sortedFilters)).toString('base64');
  }

  /**
   * Extract content type and ID from cache key
   */
  static parseContentKey(key: string): { type: string; id: number } | null {
    const match = key.match(/content:(\w+):(\d+)/);
    if (!match) return null;
    
    return {
      type: match[1],
      id: parseInt(match[2], 10),
    };
  }

  /**
   * Check if cache key matches a pattern
   */
  static matchesPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  /**
   * Get TTL for a specific cache key type
   */
  static getTTLForKey(key: string): number {
    if (key.includes('trending')) return CACHE_TTL.TRENDING;
    if (key.includes('popular')) return CACHE_TTL.POPULAR;
    if (key.includes('content:')) return CACHE_TTL.CONTENT_DETAILS;
    if (key.includes('search:')) return CACHE_TTL.SEARCH_RESULTS;
    if (key.includes('streams:')) return CACHE_TTL.STREAM_SOURCES;
    if (key.includes('genres:')) return CACHE_TTL.GENRES;
    
    return 3600; // Default 1 hour
  }
}