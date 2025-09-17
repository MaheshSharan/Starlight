import { Request, Response, NextFunction } from 'express';
import { contentService } from '@/services/content.service.js';
import { ContentType, TrendingTimeWindow } from '@/types/content.types.js';
import { APIResponse } from '@/types/api.types.js';
import { AppError } from '@/middleware/error.middleware.js';

/**
 * Content Controller for handling content discovery endpoints
 * Implements trending and popular content endpoints with pagination
 */
export class ContentController {
  
  /**
   * GET /api/content/trending
   * Get trending movies and TV shows with pagination
   */
  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        type = 'movie', 
        time_window = 'day', 
        page = 1 
      } = req.query;

      // Validate content type
      if (type !== 'movie' && type !== 'tv') {
        throw new AppError('VALIDATION_ERROR', 'Content type must be either "movie" or "tv"', 400);
      }

      // Validate time window
      if (time_window !== 'day' && time_window !== 'week') {
        throw new AppError('VALIDATION_ERROR', 'Time window must be either "day" or "week"', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const content = await contentService.getTrending(
        type as ContentType,
        time_window as TrendingTimeWindow,
        pageNum
      );

      const response: APIResponse = {
        success: true,
        data: content,
        meta: {
          page: pageNum,
          limit: 20, // TMDB default page size
          totalResults: content.length > 0 ? pageNum * 20 : 0, // Estimate
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
   * GET /api/content/popular
   * Get popular movies and TV shows with type filtering and pagination
   */
  async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        type = 'movie', 
        page = 1 
      } = req.query;

      // Validate content type
      if (type !== 'movie' && type !== 'tv') {
        throw new AppError('VALIDATION_ERROR', 'Content type must be either "movie" or "tv"', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const content = await contentService.getPopular(
        type as ContentType,
        pageNum
      );

      const response: APIResponse = {
        success: true,
        data: content,
        meta: {
          page: pageNum,
          limit: 20, // TMDB default page size
          totalResults: content.length > 0 ? pageNum * 20 : 0, // Estimate
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
   * GET /api/content/top-rated
   * Get top-rated movies and TV shows with type filtering and pagination
   */
  async getTopRated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        type = 'movie', 
        page = 1 
      } = req.query;

      // Validate content type
      if (type !== 'movie' && type !== 'tv') {
        throw new AppError('VALIDATION_ERROR', 'Content type must be either "movie" or "tv"', 400);
      }

      // Validate page number
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const content = await contentService.getTopRated(
        type as ContentType,
        pageNum
      );

      const response: APIResponse = {
        success: true,
        data: content,
        meta: {
          page: pageNum,
          limit: 20, // TMDB default page size
          totalResults: content.length > 0 ? pageNum * 20 : 0, // Estimate
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
   * GET /api/content/:type/:id
   * Get detailed content information with metadata enrichment
   */
  async getContentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;

      // Validation is handled by middleware, but double-check
      const contentType = type as ContentType;
      const contentId = parseInt(id, 10);

      const details = await contentService.getDetails(contentType, contentId);

      const response: APIResponse = {
        success: true,
        data: details,
        meta: {
          contentType,
          contentId,
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
   * GET /api/content/:type/:id/similar
   * Get similar content recommendations
   */
  async getSimilarContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;
      const { page = 1 } = req.query;

      const contentType = type as ContentType;
      const contentId = parseInt(id, 10);
      const pageNum = parseInt(page as string, 10);

      // Validate page number
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const similarContent = await contentService.getSimilar(contentType, contentId, pageNum);

      const response: APIResponse = {
        success: true,
        data: similarContent,
        meta: {
          page: pageNum,
          contentType,
          contentId,
          limit: 20,
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
   * GET /api/content/:type/:id/recommendations
   * Get content recommendations
   */
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;
      const { page = 1 } = req.query;

      const contentType = type as ContentType;
      const contentId = parseInt(id, 10);
      const pageNum = parseInt(page as string, 10);

      // Validate page number
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError('VALIDATION_ERROR', 'Page must be a number between 1 and 1000', 400);
      }

      const recommendations = await contentService.getRecommendations(contentType, contentId, pageNum);

      const response: APIResponse = {
        success: true,
        data: recommendations,
        meta: {
          page: pageNum,
          contentType,
          contentId,
          limit: 20,
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
   * GET /api/content/:type/:id/credits
   * Get content credits (cast and crew)
   */
  async getContentCredits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;

      const contentType = type as ContentType;
      const contentId = parseInt(id, 10);

      const credits = await contentService.getCredits(contentType, contentId);

      const response: APIResponse = {
        success: true,
        data: credits,
        meta: {
          contentType,
          contentId,
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
   * GET /api/content/tv/:id/season/:seasonNumber
   * Get season details for TV show
   */
  async getSeasonDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, seasonNumber } = req.params;

      const tvId = parseInt(id, 10);
      const seasonNum = parseInt(seasonNumber, 10);

      // Validate IDs
      if (isNaN(tvId) || tvId <= 0) {
        throw new AppError('VALIDATION_ERROR', 'Invalid TV show ID', 400);
      }
      
      if (isNaN(seasonNum) || seasonNum < 0) {
        throw new AppError('VALIDATION_ERROR', 'Invalid season number', 400);
      }

      const seasonDetails = await contentService.getSeasonDetails(tvId, seasonNum);

      const response: APIResponse = {
        success: true,
        data: seasonDetails,
        meta: {
          tvId,
          seasonNumber: seasonNum,
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
   * GET /api/content/tv/:id/season/:seasonNumber/episode/:episodeNumber
   * Get episode details for TV show
   */
  async getEpisodeDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, seasonNumber, episodeNumber } = req.params;

      const tvId = parseInt(id, 10);
      const seasonNum = parseInt(seasonNumber, 10);
      const episodeNum = parseInt(episodeNumber, 10);

      // Validate IDs
      if (isNaN(tvId) || tvId <= 0) {
        throw new AppError('VALIDATION_ERROR', 'Invalid TV show ID', 400);
      }
      
      if (isNaN(seasonNum) || seasonNum < 0) {
        throw new AppError('VALIDATION_ERROR', 'Invalid season number', 400);
      }

      if (isNaN(episodeNum) || episodeNum < 1) {
        throw new AppError('VALIDATION_ERROR', 'Invalid episode number', 400);
      }

      const episodeDetails = await contentService.getEpisodeDetails(tvId, seasonNum, episodeNum);

      const response: APIResponse = {
        success: true,
        data: episodeDetails,
        meta: {
          tvId,
          seasonNumber: seasonNum,
          episodeNumber: episodeNum,
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
   * GET /api/content/genres
   * Get TMDB genres for the specified media type
   */
  async getGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type = 'movie' } = req.query as { type?: string };

      if (type !== 'movie' && type !== 'tv') {
        throw new AppError('VALIDATION_ERROR', 'Content type must be either "movie" or "tv"', 400);
      }

      const genres = await contentService.getGenres(type as ContentType);

      const response: APIResponse = {
        success: true,
        data: genres,
        meta: {
          contentType: type,
          count: Array.isArray(genres) ? genres.length : 0,
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
export const contentController = new ContentController();