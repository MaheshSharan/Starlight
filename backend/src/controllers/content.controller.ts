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
}

// Export singleton instance
export const contentController = new ContentController();