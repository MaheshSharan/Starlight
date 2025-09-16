import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/middleware/error.middleware.js';

/**
 * Search Query Validation Middleware
 * Validates query parameters for search endpoints
 */
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { q: query, page, include_adult, year, primary_release_year, first_air_date_year, limit, type, genre, rating, sort_by, sort_order } = req.query;

    // Skip validation for popular-queries endpoint
    if (req.path === '/popular-queries') {
      return next();
    }

    // Validate search query (required for most endpoints except popular-queries)
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Search query (q) is required and must be a non-empty string',
        400
      );
    }

    // Validate query length
    if (query.length > 500) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Search query must be less than 500 characters',
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

    // Validate include_adult if provided
    if (include_adult && include_adult !== 'true' && include_adult !== 'false') {
      throw new AppError(
        'VALIDATION_ERROR',
        'include_adult must be either "true" or "false"',
        400
      );
    }

    // Validate year parameters if provided
    const currentYear = new Date().getFullYear();

    if (year) {
      const yearNum = parseInt(year as string, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 5) {
        throw new AppError(
          'VALIDATION_ERROR',
          `Year must be a number between 1900 and ${currentYear + 5}`,
          400
        );
      }
    }

    if (primary_release_year) {
      const yearNum = parseInt(primary_release_year as string, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 5) {
        throw new AppError(
          'VALIDATION_ERROR',
          `Primary release year must be a number between 1900 and ${currentYear + 5}`,
          400
        );
      }
    }

    if (first_air_date_year) {
      const yearNum = parseInt(first_air_date_year as string, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 5) {
        throw new AppError(
          'VALIDATION_ERROR',
          `First air date year must be a number between 1900 and ${currentYear + 5}`,
          400
        );
      }
    }

    // Validate limit for suggestions endpoint
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Limit must be a number between 1 and 50',
          400
        );
      }
    }

    // Validate content type if provided
    if (type && type !== 'movie' && type !== 'tv') {
      throw new AppError(
        'VALIDATION_ERROR',
        'Content type must be either "movie" or "tv"',
        400
      );
    }

    // Validate genre if provided (comma-separated genre IDs)
    if (genre) {
      const genreIds = (genre as string).split(',');
      for (const genreId of genreIds) {
        const id = parseInt(genreId.trim(), 10);
        if (isNaN(id) || id < 1) {
          throw new AppError(
            'VALIDATION_ERROR',
            'Genre IDs must be positive numbers separated by commas',
            400
          );
        }
      }
    }

    // Validate rating if provided
    if (rating) {
      const ratingNum = parseFloat(rating as string);
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Rating must be a number between 0 and 10',
          400
        );
      }
    }

    // Validate sort_by and sort_order
    if (sort_by) {
      const validSortFields = ['popularity', 'release_date', 'revenue', 'primary_release_date', 'original_title', 'vote_average', 'vote_count', 'first_air_date'];

      // Check if sort_by contains a dot (combined format like 'popularity.desc')
      if ((sort_by as string).includes('.')) {
        const validSortOptions = [
          'popularity.desc', 'popularity.asc',
          'release_date.desc', 'release_date.asc',
          'revenue.desc', 'revenue.asc',
          'primary_release_date.desc', 'primary_release_date.asc',
          'original_title.desc', 'original_title.asc',
          'vote_average.desc', 'vote_average.asc',
          'vote_count.desc', 'vote_count.asc',
          'first_air_date.desc', 'first_air_date.asc'
        ];

        if (!validSortOptions.includes(sort_by as string)) {
          throw new AppError(
            'VALIDATION_ERROR',
            `Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`,
            400
          );
        }
      } else {
        // Separate sort_by and sort_order format
        if (!validSortFields.includes(sort_by as string)) {
          throw new AppError(
            'VALIDATION_ERROR',
            `Invalid sort field. Valid fields are: ${validSortFields.join(', ')}`,
            400
          );
        }
      }
    }

    // Validate sort_order if provided
    if (sort_order && sort_order !== 'asc' && sort_order !== 'desc') {
      throw new AppError(
        'VALIDATION_ERROR',
        'Sort order must be either "asc" or "desc"',
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Advanced Search Validation Middleware
 * Validates complex search parameters for advanced search
 */
export const validateAdvancedSearch = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { filters } = req.body;

    if (filters) {
      // Validate genre array
      if (filters.genre && Array.isArray(filters.genre)) {
        for (const genreId of filters.genre) {
          if (typeof genreId !== 'number' || genreId < 1) {
            throw new AppError(
              'VALIDATION_ERROR',
              'Genre IDs must be positive numbers',
              400
            );
          }
        }
      }

      // Validate rating range
      if (filters.vote_average_gte && (typeof filters.vote_average_gte !== 'number' || filters.vote_average_gte < 0 || filters.vote_average_gte > 10)) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Minimum vote average must be a number between 0 and 10',
          400
        );
      }

      if (filters.vote_average_lte && (typeof filters.vote_average_lte !== 'number' || filters.vote_average_lte < 0 || filters.vote_average_lte > 10)) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Maximum vote average must be a number between 0 and 10',
          400
        );
      }

      // Validate vote count
      if (filters.vote_count_gte && (typeof filters.vote_count_gte !== 'number' || filters.vote_count_gte < 0)) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Minimum vote count must be a non-negative number',
          400
        );
      }

      // Validate runtime range
      if (filters.runtime_gte && (typeof filters.runtime_gte !== 'number' || filters.runtime_gte < 0)) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Minimum runtime must be a non-negative number',
          400
        );
      }

      if (filters.runtime_lte && (typeof filters.runtime_lte !== 'number' || filters.runtime_lte < 0)) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Maximum runtime must be a non-negative number',
          400
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};