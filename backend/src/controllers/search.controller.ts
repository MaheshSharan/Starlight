import { Request, Response, NextFunction } from 'express';
import { searchService } from '@/services/search.service.js';
import { SearchParams, SearchFilters } from '@/types/search.types.js';
import { ContentType } from '@/types/content.types.js';
import { APIResponse } from '@/types/api.types.js';
import { AppError } from '@/middleware/error.middleware.js';

/**
 * Search Controller for handling search functionality endpoints
 * Implements search with query and filter support, pagination, and analytics
 */
export class SearchController {

  /**
   * GET /api/search
   * Multi-search across movies and TV shows with query and filter support
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        q: query, 
        page = 1, 
        include_adult = false, 
        region, 
        year,
        type,
        genre,
        rating,
        sort_by,
        sort_order
      } = req.query;

      // Validate required query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'Search query is required', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      // Validate content type if provided
      if (type && type !== 'movie' && type !== 'tv') {
        throw new AppError('VALIDATION_ERROR', 'Content type must be either "movie" or "tv"', 400);
      }

      // Build search parameters
      const searchParams: SearchParams = {
        query: query.trim(),
        page: pageNum,
        include_adult: include_adult === 'true',
        region: region as string,
        year: year ? parseInt(year as string, 10) : undefined,
      };

      // Combine sort_by and sort_order if provided separately
      let combinedSortBy = sort_by as string;
      if (sort_by && sort_order && !(sort_by as string).includes('.')) {
        combinedSortBy = `${sort_by}.${sort_order}`;
      }

      // Build filters for advanced search
      const filters: SearchFilters = {
        type: type as ContentType,
        genre: genre ? (genre as string).split(',').map(g => parseInt(g, 10)) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        sort_by: combinedSortBy as any,
        sort_order: sort_order as any,
        include_adult: searchParams.include_adult,
        region: searchParams.region,
        year: searchParams.year,
      };

      // Use advanced search if filters are provided, otherwise use basic search
      const hasFilters = filters.type || filters.genre || filters.rating || filters.sort_by;
      
      const searchResult = hasFilters 
        ? await searchService.advancedSearch(searchParams.query, filters, pageNum)
        : await searchService.search(searchParams);

      const response: APIResponse = {
        success: true,
        data: searchResult,
        meta: {
          query: searchResult.query,
          filters: searchResult.filters,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/search/movies
   * Movie-specific search with filters
   */
  async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        q: query, 
        page = 1, 
        include_adult = false, 
        region, 
        year,
        primary_release_year
      } = req.query;

      // Validate required query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'Search query is required', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const searchParams: SearchParams = {
        query: query.trim(),
        page: pageNum,
        include_adult: include_adult === 'true',
        region: region as string,
        year: year ? parseInt(year as string, 10) : undefined,
        primary_release_year: primary_release_year ? parseInt(primary_release_year as string, 10) : undefined,
      };

      const searchResult = await searchService.searchMovies(searchParams);

      const response: APIResponse = {
        success: true,
        data: searchResult,
        meta: {
          query: searchResult.query,
          filters: searchResult.filters,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/search/tv
   * TV show-specific search with filters
   */
  async searchTVShows(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        q: query, 
        page = 1, 
        include_adult = false, 
        first_air_date_year
      } = req.query;

      // Validate required query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'Search query is required', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const searchParams: SearchParams = {
        query: query.trim(),
        page: pageNum,
        include_adult: include_adult === 'true',
        first_air_date_year: first_air_date_year ? parseInt(first_air_date_year as string, 10) : undefined,
      };

      const searchResult = await searchService.searchTVShows(searchParams);

      const response: APIResponse = {
        success: true,
        data: searchResult,
        meta: {
          query: searchResult.query,
          filters: searchResult.filters,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/search/suggestions
   * Get search suggestions/autocomplete
   */
  async getSearchSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, limit = 5 } = req.query;

      // Validate required query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'Search query is required', 400);
      }

      // Validate limit
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
        throw new AppError('VALIDATION_ERROR', 'Limit must be a number between 1 and 20', 400);
      }

      const suggestions = await searchService.getSearchSuggestions(query.trim(), limitNum);

      const response: APIResponse = {
        success: true,
        data: suggestions,
        meta: {
          query: query.trim(),
          limit: limitNum,
          count: suggestions.length,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/search/popular-queries
   * Get popular search queries for analytics
   */
  async getPopularQueries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      // Validate limit
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new AppError('VALIDATION_ERROR', 'Limit must be a number between 1 and 50', 400);
      }

      const popularQueries = await searchService.getPopularQueries(limitNum);

      const response: APIResponse = {
        success: true,
        data: popularQueries,
        meta: {
          limit: limitNum,
          count: popularQueries.length,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const searchController = new SearchController();