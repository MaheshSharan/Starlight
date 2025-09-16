import { TMDBService } from './tmdb.service.js';
import { CacheService } from './cache.service.js';
import { ISearchService } from '@/types/service.interfaces.js';
import { 
  SearchResult, 
  SearchParams, 
  SearchFilters, 
  SearchAnalytics 
} from '@/types/search.types.js';
import { Content, ContentType, TMDBResponse } from '@/types/content.types.js';
import { CACHE_KEYS, CACHE_TTL } from '@/utils/cache-keys.js';
import { databaseService } from '@/config/database.js';

/**
 * Search Service with cache-first data fetching and analytics tracking
 * Implements search functionality with pagination and filtering
 */
export class SearchService implements ISearchService {
  private tmdbService: TMDBService;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
    this.tmdbService = new TMDBService(this.cacheService);
  }

  /**
   * Multi-search across movies and TV shows
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, page = 1, include_adult = false, region, year } = params;
    
    // Create cache key based on search parameters
    const cacheKey = CACHE_KEYS.SEARCH_RESULTS(query, { 
      page, 
      include_adult, 
      region, 
      year 
    });

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for search query: "${query}"`);
        return cachedData;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, searching TMDB API for: "${query}"`);
      const apiData = await this.tmdbService.multiSearch(query, page, {
        include_adult,
        region,
        year,
      });

      // Filter results to only include movies and TV shows
      const filteredResults = apiData.results.filter((item: any) => 
        item.media_type === 'movie' || item.media_type === 'tv'
      );

      const searchResult: SearchResult = {
        results: filteredResults,
        page: apiData.page || 1,
        total_pages: apiData.total_pages || 1,
        total_results: apiData.total_results || 0,
        query,
        filters: { include_adult, region, year } as SearchFilters,
      };

      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, searchResult, { 
        ttl: CACHE_TTL.SEARCH_RESULTS 
      });

      // Track search analytics
      await this.trackSearch({
        query,
        filters: searchResult.filters,
        results_count: searchResult.total_results,
      });

      return searchResult;
    } catch (error) {
      console.error(`❌ Error searching for "${query}":`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for search: "${query}"`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * Movie-specific search
   */
  async searchMovies(params: SearchParams): Promise<SearchResult> {
    const { query, page = 1, include_adult = false, region, year, primary_release_year } = params;
    
    const cacheKey = CACHE_KEYS.SEARCH_MOVIES(query, { 
      page, 
      include_adult, 
      region, 
      year, 
      primary_release_year 
    });

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for movie search: "${query}"`);
        return cachedData;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, searching movies in TMDB API for: "${query}"`);
      const apiData = await this.tmdbService.search('movie', query, page, {
        include_adult,
        region,
        year,
        primary_release_year,
      });

      const searchResult: SearchResult = {
        results: apiData.results.map((item: any) => ({ ...item, media_type: 'movie' })),
        page: apiData.page || 1,
        total_pages: apiData.total_pages || 1,
        total_results: apiData.total_results || 0,
        query,
        filters: { 
          type: 'movie', 
          include_adult, 
          region, 
          year, 
          primary_release_year 
        } as SearchFilters,
      };

      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, searchResult, { 
        ttl: CACHE_TTL.SEARCH_RESULTS 
      });

      // Track search analytics
      await this.trackSearch({
        query,
        filters: searchResult.filters,
        results_count: searchResult.total_results,
      });

      return searchResult;
    } catch (error) {
      console.error(`❌ Error searching movies for "${query}":`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for movie search: "${query}"`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * TV show-specific search
   */
  async searchTVShows(params: SearchParams): Promise<SearchResult> {
    const { query, page = 1, include_adult = false, first_air_date_year } = params;
    
    const cacheKey = CACHE_KEYS.SEARCH_TV(query, { 
      page, 
      include_adult, 
      first_air_date_year 
    });

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for TV search: "${query}"`);
        return cachedData;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, searching TV shows in TMDB API for: "${query}"`);
      const apiData = await this.tmdbService.search('tv', query, page, {
        include_adult,
        first_air_date_year,
      });

      const searchResult: SearchResult = {
        results: apiData.results.map((item: any) => ({ ...item, media_type: 'tv' })),
        page: apiData.page || 1,
        total_pages: apiData.total_pages || 1,
        total_results: apiData.total_results || 0,
        query,
        filters: { 
          type: 'tv', 
          include_adult, 
          first_air_date_year 
        } as SearchFilters,
      };

      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, searchResult, { 
        ttl: CACHE_TTL.SEARCH_RESULTS 
      });

      // Track search analytics
      await this.trackSearch({
        query,
        filters: searchResult.filters,
        results_count: searchResult.total_results,
      });

      return searchResult;
    } catch (error) {
      console.error(`❌ Error searching TV shows for "${query}":`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for TV search: "${query}"`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(query: string, filters: SearchFilters, page: number = 1): Promise<SearchResult> {
    const cacheKey = CACHE_KEYS.ADVANCED_SEARCH(query, filters, page);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for advanced search: "${query}"`);
        return cachedData;
      }

      // Determine search type based on filters
      const searchType = filters.type || 'multi';
      
      let apiData: TMDBResponse<Content>;
      
      if (searchType === 'multi') {
        apiData = await this.tmdbService.multiSearch(query, page, {
          include_adult: filters.include_adult,
          region: filters.region,
        });
        
        // Filter results based on additional filters
        apiData.results = this.applyClientSideFilters(apiData.results, filters);
      } else {
        // Use specific search endpoint
        const searchParams: any = {
          include_adult: filters.include_adult,
          region: filters.region,
        };

        if (searchType === 'movie') {
          searchParams.primary_release_year = filters.primary_release_year;
          searchParams.year = filters.year;
        } else if (searchType === 'tv') {
          searchParams.first_air_date_year = filters.first_air_date_year;
        }

        apiData = await this.tmdbService.search(searchType, query, page, searchParams);
        
        // Apply additional filters
        apiData.results = this.applyClientSideFilters(apiData.results, filters);
      }

      const searchResult: SearchResult = {
        results: apiData.results,
        page: apiData.page || 1,
        total_pages: apiData.total_pages || 1,
        total_results: apiData.total_results || 0,
        query,
        filters,
      };

      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, searchResult, { 
        ttl: CACHE_TTL.SEARCH_RESULTS 
      });

      // Track search analytics
      await this.trackSearch({
        query,
        filters,
        results_count: searchResult.total_results,
      });

      return searchResult;
    } catch (error) {
      console.error(`❌ Error in advanced search for "${query}":`, error);
      
      // Try to return stale cache data as last resort
      const staleData = await this.cacheService.getWithOptions<SearchResult>(cacheKey);
      if (staleData) {
        console.log(`⚠️ Returning stale cache data for advanced search: "${query}"`);
        return staleData;
      }
      
      throw error;
    }
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<Content[]> {
    if (query.length < 2) {
      return [];
    }

    const cacheKey = CACHE_KEYS.SEARCH_SUGGESTIONS(query, limit);

    try {
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<Content[]>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for search suggestions: "${query}"`);
        return cachedData;
      }

      // Fallback to API
      console.log(`🌐 Cache miss, getting search suggestions for: "${query}"`);
      const apiData = await this.tmdbService.multiSearch(query, 1, {
        include_adult: false,
      });

      // Filter and limit results for suggestions
      const suggestions = apiData.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, limit);

      // Cache the result with shorter TTL
      await this.cacheService.setWithOptions(cacheKey, suggestions, { 
        ttl: CACHE_TTL.SEARCH_SUGGESTIONS 
      });

      return suggestions;
    } catch (error) {
      console.error(`❌ Error getting search suggestions for "${query}":`, error);
      return [];
    }
  }

  /**
   * Track search analytics
   */
  async trackSearch(analytics: Omit<SearchAnalytics, 'id' | 'created_at'>): Promise<void> {
    try {
      const db = databaseService.getClient();
      
      await db.searchAnalytics.create({
        data: {
          query: analytics.query,
          filters: analytics.filters ? JSON.stringify(analytics.filters) : undefined,
          resultsCount: analytics.results_count,
        },
      });

      console.log(`📊 Tracked search analytics for: "${analytics.query}"`);
    } catch (error) {
      console.error('❌ Error tracking search analytics:', error);
      // Don't throw error as analytics tracking shouldn't break the search
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularQueries(limit: number = 10): Promise<string[]> {
    try {
      const cacheKey = CACHE_KEYS.POPULAR_QUERIES(limit);
      
      // Try cache first
      const cachedData = await this.cacheService.getWithOptions<string[]>(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for popular queries');
        return cachedData;
      }

      // Query database for popular searches
      const db = databaseService.getClient();
      
      const popularQueries = await db.searchAnalytics.groupBy({
        by: ['query'],
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: limit,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      const queries = popularQueries.map(item => item.query);

      // Cache the result
      await this.cacheService.setWithOptions(cacheKey, queries, { 
        ttl: CACHE_TTL.POPULAR_QUERIES 
      });

      return queries;
    } catch (error) {
      console.error('❌ Error getting popular queries:', error);
      return [];
    }
  }

  /**
   * Apply client-side filters to search results
   */
  private applyClientSideFilters(results: Content[], filters: SearchFilters): Content[] {
    let filteredResults = [...results];

    // Filter by genre
    if (filters.genre && filters.genre.length > 0) {
      filteredResults = filteredResults.filter(item => 
        filters.genre!.some(genreId => item.genre_ids.includes(genreId))
      );
    }

    // Filter by rating
    if (filters.rating) {
      filteredResults = filteredResults.filter(item => 
        item.vote_average >= filters.rating!
      );
    }

    // Filter by vote average range
    if (filters.vote_average_gte) {
      filteredResults = filteredResults.filter(item => 
        item.vote_average >= filters.vote_average_gte!
      );
    }

    if (filters.vote_average_lte) {
      filteredResults = filteredResults.filter(item => 
        item.vote_average <= filters.vote_average_lte!
      );
    }

    // Filter by vote count
    if (filters.vote_count_gte) {
      filteredResults = filteredResults.filter(item => 
        item.vote_count >= filters.vote_count_gte!
      );
    }

    // Sort results if specified
    if (filters.sort_by) {
      filteredResults = this.sortResults(filteredResults, filters.sort_by, filters.sort_order);
    }

    return filteredResults;
  }

  /**
   * Sort search results
   */
  private sortResults(results: Content[], sortBy: string, sortOrder: string = 'desc'): Content[] {
    const sortedResults = [...results];

    sortedResults.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'popularity.desc':
        case 'popularity.asc':
          aValue = a.popularity;
          bValue = b.popularity;
          break;
        case 'vote_average.desc':
        case 'vote_average.asc':
          aValue = a.vote_average;
          bValue = b.vote_average;
          break;
        case 'vote_count.desc':
        case 'vote_count.asc':
          aValue = a.vote_count;
          bValue = b.vote_count;
          break;
        case 'release_date.desc':
        case 'release_date.asc':
        case 'primary_release_date.desc':
        case 'primary_release_date.asc':
          aValue = new Date(a.release_date || a.first_air_date || '1900-01-01');
          bValue = new Date(b.release_date || b.first_air_date || '1900-01-01');
          break;
        case 'first_air_date.desc':
        case 'first_air_date.asc':
          aValue = new Date(a.first_air_date || '1900-01-01');
          bValue = new Date(b.first_air_date || '1900-01-01');
          break;
        case 'original_title.desc':
        case 'original_title.asc':
          aValue = (a.title || a.name || '').toLowerCase();
          bValue = (b.title || b.name || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc' || sortBy.includes('.asc')) {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sortedResults;
  }
}

// Export singleton instance
export const searchService = new SearchService();