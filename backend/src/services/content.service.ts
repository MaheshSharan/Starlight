import { TMDBService } from './tmdb.service.js';
import { CacheService } from './cache.service.js';
import { IContentService } from '@/types/service.interfaces.js';
import { 
  Content, 
  ContentDetails, 
  ContentType, 
  TrendingTimeWindow,
  Genre,
  TMDBResponse 
} from '@/types/content.types.js';
import { DiscoverParams } from '@/types/search.types.js';
import { CACHE_KEYS, CACHE_TTL } from '@/utils/cache-keys.js';

/**
 * Content Service with cache-first data fetching and fallback to TMDB API
 * Implements cache invalidation and refresh strategies
 */
export class ContentService implements IContentService {
  private tmdbService: TMDBService;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
    this.tmdbService = new TMDBService(this.cacheService);
  }

  /**
   * Get trending content with cache-first strategy
   */
  async getTrending(
    type: ContentType, 
    timeWindow: TrendingTimeWindow, 
    page: number = 1
  ): Promise<Content[]> {
    const cacheKey = type === 'movie' 
      ? CACHE_KEYS.TRENDING_MOVIES(page)
      : CACHE_KEYS.TRENDING_TV(page);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for trending ${type}, page ${page}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching trending ${type} from TMDB API`);
      const apiData = await this.tmdbService.getTrending(type, timeWindow, page);
      
      // Add media_type to results since TMDB trending includes it, but ensure consistency
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: item.media_type || type // Use existing media_type or fallback to endpoint type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.TRENDING });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error fetching trending ${type}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for trending ${type}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }

  /**
   * Get popular content with cache-first strategy
   */
  async getPopular(type: ContentType, page: number = 1): Promise<Content[]> {
    const cacheKey = type === 'movie' 
      ? CACHE_KEYS.POPULAR_MOVIES(page)
      : CACHE_KEYS.POPULAR_TV(page);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for popular ${type}, page ${page}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching popular ${type} from TMDB API`);
      const apiData = await this.tmdbService.getPopular(type, page);
      
      // Add media_type to results since TMDB popular endpoints don't include it
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.POPULAR });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error fetching popular ${type}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for popular ${type}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }

  /**
   * Get top rated content with cache-first strategy
   */
  async getTopRated(type: ContentType, page: number = 1): Promise<Content[]> {
    const cacheKey = type === 'movie' 
      ? CACHE_KEYS.TOP_RATED_MOVIES(page)
      : CACHE_KEYS.TOP_RATED_TV(page);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for top rated ${type}, page ${page}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching top rated ${type} from TMDB API`);
      const apiData = await this.tmdbService.getTopRated(type, page);
      
      // Add media_type to results since TMDB top_rated endpoints don't include it
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.TOP_RATED });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error fetching top rated ${type}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for top rated ${type}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }  /**

   * Get content details with cache-first strategy
   */
  async getDetails(type: ContentType, id: number): Promise<ContentDetails> {
    const cacheKey = CACHE_KEYS.CONTENT_DETAILS(type, id);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<ContentDetails>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for ${type} details, ID: ${id}`);
        return cachedData;
      }

      // Fallback to API with additional data
      console.log(`🌐 Cache miss, fetching ${type} details from TMDB API`);
      const apiData = await this.tmdbService.getDetails(
        type, 
        id, 
        'credits,similar,recommendations'
      );
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, apiData, { ttl: CACHE_TTL.CONTENT_DETAILS });
      
      return apiData;
    } catch (error) {
      console.error(`❌ Error fetching ${type} details for ID ${id}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<ContentDetails>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for ${type} details, ID: ${id}`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * Get similar content with cache-first strategy
   */
  async getSimilar(type: ContentType, id: number, page: number = 1): Promise<Content[]> {
    const cacheKey = CACHE_KEYS.CONTENT_SIMILAR(type, id);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for similar ${type}, ID: ${id}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching similar ${type} from TMDB API`);
      const apiData = await this.tmdbService.getSimilar(type, id, page);
      
      // Add media_type to results since TMDB similar endpoints don't include it
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.CONTENT_SIMILAR });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error fetching similar ${type} for ID ${id}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for similar ${type}, ID: ${id}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }

  /**
   * Get recommended content with cache-first strategy
   */
  async getRecommendations(type: ContentType, id: number, page: number = 1): Promise<Content[]> {
    const cacheKey = CACHE_KEYS.CONTENT_RECOMMENDATIONS(type, id);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for recommendations ${type}, ID: ${id}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching recommendations ${type} from TMDB API`);
      const apiData = await this.tmdbService.getRecommendations(type, id, page);
      
      // Add media_type to results since TMDB recommendations endpoints don't include it
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.CONTENT_RECOMMENDATIONS });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error fetching recommendations ${type} for ID ${id}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for recommendations ${type}, ID: ${id}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }

  /**
   * Discover content with filters
   */
  async discover(type: ContentType, params: DiscoverParams): Promise<Content[]> {
    // Create cache key based on discover parameters
    const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64');
    const cacheKey = `discover:${type}:${paramsHash}`;

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for discover ${type}`);
        // Ensure cached data has media_type for consistency
        const resultsWithMediaType = cachedData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, discovering ${type} from TMDB API`);
      const apiData = await this.tmdbService.discover(type, params);
      
      // Add media_type to results since TMDB discover endpoints don't include it
      const resultsWithMediaType = apiData.results.map((item: any) => ({
        ...item,
        media_type: type
      }));
      
      const processedData = { ...apiData, results: resultsWithMediaType };
      
      // Cache the result with shorter TTL for discover queries
      await this.cacheService.setWithOptions(cacheKey, processedData, { ttl: CACHE_TTL.SEARCH_RESULTS });
      
      return resultsWithMediaType;
    } catch (error) {
      console.error(`❌ Error discovering ${type}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<TMDBResponse<Content>>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for discover ${type}`);
        // Ensure stale data has media_type for consistency
        const resultsWithMediaType = staleData.results.map((item: any) => ({
          ...item,
          media_type: item.media_type || type
        }));
        return resultsWithMediaType;
      }
      
      throw error;
    }
  }  /*
*
   * Get genres with cache-first strategy
   */
  async getGenres(type: ContentType): Promise<Genre[]> {
    const cacheKey = CACHE_KEYS.GENRES(type);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<{ genres: Genre[] }>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for ${type} genres`);
        return cachedData.genres;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching ${type} genres from TMDB API`);
      const apiData = await this.tmdbService.getGenres(type);
      
      // Cache the result with long TTL since genres rarely change
      await this.cacheService.setWithOptions(cacheKey, apiData, { ttl: CACHE_TTL.GENRES });
      
      return apiData.genres;
    } catch (error) {
      console.error(`❌ Error fetching ${type} genres:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<{ genres: Genre[] }>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for ${type} genres`);
        return staleData.genres;
      }
      
      throw error;
    }
  }

  /**
   * Get credits for content
   */
  async getCredits(type: ContentType, id: number): Promise<any> {
    const cacheKey = CACHE_KEYS.CONTENT_CREDITS(type, id);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<any>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for ${type} credits, ID: ${id}`);
        return cachedData;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, fetching ${type} credits from TMDB API`);
      const apiData = await this.tmdbService.getCredits(type, id);
      
      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, apiData, { ttl: CACHE_TTL.CONTENT_CREDITS });
      
      return apiData;
    } catch (error) {
      console.error(`❌ Error fetching ${type} credits for ID ${id}:`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<any>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for ${type} credits, ID: ${id}`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * Cache invalidation methods
   */

  /**
   * Invalidate all trending content cache
   */
  async invalidateTrendingCache(): Promise<void> {
    try {
      await this.cacheService.invalidateWithOptions('trending:*');
      console.log('🗑️ Invalidated all trending content cache');
    } catch (error) {
      console.error('❌ Error invalidating trending cache:', error);
    }
  }

  /**
   * Invalidate all popular content cache
   */
  async invalidatePopularCache(): Promise<void> {
    try {
      await this.cacheService.invalidateWithOptions('popular:*');
      console.log('🗑️ Invalidated all popular content cache');
    } catch (error) {
      console.error('❌ Error invalidating popular cache:', error);
    }
  }

  /**
   * Invalidate specific content and related data
   */
  async invalidateContentCache(type: ContentType, id: number): Promise<void> {
    try {
      const patterns = [
        CACHE_KEYS.CONTENT_DETAILS(type, id),
        CACHE_KEYS.CONTENT_CREDITS(type, id),
        CACHE_KEYS.CONTENT_SIMILAR(type, id),
        CACHE_KEYS.CONTENT_RECOMMENDATIONS(type, id)
      ];

      for (const pattern of patterns) {
        await this.cacheService.delete(pattern);
      }
      
      console.log(`🗑️ Invalidated cache for ${type} ID: ${id}`);
    } catch (error) {
      console.error(`❌ Error invalidating content cache for ${type} ID ${id}:`, error);
    }
  }

  /**
   * Refresh cache in background for frequently accessed content
   */
  async refreshCache(type: ContentType, timeWindow: TrendingTimeWindow = 'day'): Promise<void> {
    try {
      console.log(`🔄 Background refresh started for ${type} content`);
      
      // Refresh trending content (first 3 pages)
      for (let page = 1; page <= 3; page++) {
        await this.getTrending(type, timeWindow, page);
        await this.getPopular(type, page);
      }
      
      // Refresh genres
      await this.getGenres(type);
      
      console.log(`✅ Background refresh completed for ${type} content`);
    } catch (error) {
      console.error(`❌ Error during background refresh for ${type}:`, error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage?: string;
  }> {
    return this.cacheService.getStats();
  }
}

// Export singleton instance
export const contentService = new ContentService();