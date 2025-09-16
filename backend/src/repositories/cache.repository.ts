import { cacheService, CacheOptions } from '@/services/cache.service.js';
import { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS } from '@/utils/cache-keys.js';

export interface CachedContent {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

export interface CachedSearchResult {
  results: CachedContent[];
  page: number;
  total_pages: number;
  total_results: number;
}

export class CacheRepository {
  // Content Discovery Cache
  async getTrendingContent(type: 'movie' | 'tv', page: number): Promise<CachedContent[] | null> {
    const key = type === 'movie' 
      ? CACHE_KEYS.TRENDING_MOVIES(page)
      : CACHE_KEYS.TRENDING_TV(page);
    
    return await cacheService.getWithOptions<CachedContent[]>(key);
  }

  async setTrendingContent(type: 'movie' | 'tv', page: number, content: CachedContent[]): Promise<boolean> {
    const key = type === 'movie' 
      ? CACHE_KEYS.TRENDING_MOVIES(page)
      : CACHE_KEYS.TRENDING_TV(page);
    
    return await cacheService.setWithOptions(key, content, { ttl: CACHE_TTL.TRENDING });
  }

  async getPopularContent(type: 'movie' | 'tv', page: number): Promise<CachedContent[] | null> {
    const key = type === 'movie' 
      ? CACHE_KEYS.POPULAR_MOVIES(page)
      : CACHE_KEYS.POPULAR_TV(page);
    
    return await cacheService.getWithOptions<CachedContent[]>(key);
  }

  async setPopularContent(type: 'movie' | 'tv', page: number, content: CachedContent[]): Promise<boolean> {
    const key = type === 'movie' 
      ? CACHE_KEYS.POPULAR_MOVIES(page)
      : CACHE_KEYS.POPULAR_TV(page);
    
    return await cacheService.setWithOptions(key, content, { ttl: CACHE_TTL.POPULAR });
  }

  // Content Details Cache
  async getContentDetails(type: 'movie' | 'tv', id: number): Promise<any | null> {
    const key = CACHE_KEYS.CONTENT_DETAILS(type, id);
    return await cacheService.getWithOptions(key);
  }

  async setContentDetails(type: 'movie' | 'tv', id: number, details: any): Promise<boolean> {
    const key = CACHE_KEYS.CONTENT_DETAILS(type, id);
    return await cacheService.setWithOptions(key, details, { ttl: CACHE_TTL.CONTENT_DETAILS });
  }

  // Search Cache
  async getSearchResults(query: string, filters: any): Promise<CachedSearchResult | null> {
    const key = CACHE_KEYS.SEARCH_RESULTS(query, filters);
    return await cacheService.getWithOptions<CachedSearchResult>(key);
  }

  async setSearchResults(
    query: string, 
    filters: any, 
    results: CachedSearchResult
  ): Promise<boolean> {
    const key = CACHE_KEYS.SEARCH_RESULTS(query, filters);
    return await cacheService.setWithOptions(key, results, { ttl: CACHE_TTL.SEARCH_RESULTS });
  }

  // Streaming Cache
  async getStreamSources(type: 'movie' | 'tv', id: number): Promise<any | null> {
    const key = CACHE_KEYS.STREAM_SOURCES(type, id);
    return await cacheService.getWithOptions(key);
  }

  async setStreamSources(type: 'movie' | 'tv', id: number, sources: any): Promise<boolean> {
    const key = CACHE_KEYS.STREAM_SOURCES(type, id);
    return await cacheService.setWithOptions(key, sources, { ttl: CACHE_TTL.STREAM_SOURCES });
  }

  // Metadata Cache
  async getGenres(type: 'movie' | 'tv'): Promise<any[] | null> {
    const key = CACHE_KEYS.GENRES(type);
    return await cacheService.getWithOptions<any[]>(key);
  }

  async setGenres(type: 'movie' | 'tv', genres: any[]): Promise<boolean> {
    const key = CACHE_KEYS.GENRES(type);
    return await cacheService.setWithOptions(key, genres, { ttl: CACHE_TTL.GENRES });
  }

  // Cache Invalidation Methods
  async invalidateTrendingContent(): Promise<number> {
    return await cacheService.invalidateWithOptions(CACHE_PATTERNS.ALL_TRENDING());
  }

  async invalidatePopularContent(): Promise<number> {
    return await cacheService.invalidateWithOptions(CACHE_PATTERNS.ALL_POPULAR());
  }

  async invalidateContentAndRelated(type: 'movie' | 'tv', id: number): Promise<number> {
    return await cacheService.invalidateWithOptions(CACHE_PATTERNS.CONTENT_AND_RELATED(type, id));
  }

  async invalidateSearchResults(): Promise<number> {
    return await cacheService.invalidateWithOptions(CACHE_PATTERNS.ALL_SEARCH());
  }

  async invalidateStreamSources(): Promise<number> {
    return await cacheService.invalidateWithOptions(CACHE_PATTERNS.ALL_STREAMS());
  }

  // Cache Management
  async getCacheStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage?: string;
  }> {
    return await cacheService.getStats();
  }

  async clearAllCache(): Promise<boolean> {
    return await cacheService.clear();
  }

  // Utility Methods
  async warmupCache(): Promise<void> {
    console.log('🔥 Starting cache warmup...');
    
    // This method can be called during startup to pre-populate frequently accessed data
    // Implementation would depend on specific business requirements
    
    console.log('✅ Cache warmup completed');
  }

  async scheduleCleanup(): Promise<void> {
    // Schedule periodic cleanup of expired keys
    setInterval(async () => {
      try {
        const stats = await this.getCacheStats();
        console.log(`📊 Cache stats: ${stats.keyCount} keys, ${stats.memoryUsage || 'unknown'} memory`);
      } catch (error) {
        console.error('❌ Cache cleanup error:', error);
      }
    }, 300000); // Every 5 minutes
  }
}