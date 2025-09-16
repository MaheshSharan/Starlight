import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/middleware/error.middleware.js';

/**
 * Content Query Validation Middleware
 * Validates query parameters for content discovery endpoints
 */
export const validateContentQuery = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { type, time_window, page } = req.query;

    // Validate content type if provided
    if (type && type !== 'movie' && type !== 'tv') {
      throw new AppError(
        'VALIDATION_ERROR', 
        'Content type must be either "movie" or "tv"', 
        400
      );
    }

    // Validate time window if provided (for trending endpoint)
    if (time_window && time_window !== 'day' && time_window !== 'week') {
      throw new AppError(
        'VALIDATION_ERROR', 
        'Time window must be either "day" or "week"', 
        400
      );
    }

    // Validate page number if provided
    if (page) {
      const pageNum = parseInt(page as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
        throw new AppError(
          'VALIDATION_ERROR', 
          'Page must be a number between 1 and 1000', 
          400
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Content ID Validation Middleware
 * Validates content ID parameter for detail endpoints
 */
export const validateContentId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id, type } = req.params;

    // Validate content type
    if (type !== 'movie' && type !== 'tv') {
      throw new AppError(
        'VALIDATION_ERROR', 
        'Content type must be either "movie" or "tv"', 
        400
      );
    }

    // Validate content ID
    const contentId = parseInt(id, 10);
    if (isNaN(contentId) || contentId < 1) {
      throw new AppError(
        'VALIDATION_ERROR', 
        'Content ID must be a positive number', 
        400
      );
    }

    // Add validated values to request for use in controller
    req.params.id = contentId.toString();
    req.params.type = type;

    next();
  } catch (error) {
    next(error);
  }
};