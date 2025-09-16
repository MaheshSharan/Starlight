import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { contentService } from '../services/content.service.js';
import { Content } from '../types/content.types.js';

// Mock the content service
vi.mock('@/services/content.service.js', () => ({
  contentService: {
    getTrending: vi.fn(),
    getPopular: vi.fn(),
    getTopRated: vi.fn(),
  },
}));

describe('ContentController', () => {
  let controller: ContentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ContentController();
    mockRequest = {
      query: {},
      originalUrl: '/api/content/trending',
    };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('getTrending', () => {
    const mockContent: Content[] = [
      {
        id: 1,
        title: 'Test Movie',
        overview: 'Test overview',
        poster_path: '/test.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        popularity: 100,
        genre_ids: [28, 12],
        media_type: 'movie',
        adult: false,
        original_language: 'en',
      },
    ];

    it('should return trending movies with default parameters', async () => {
      vi.mocked(contentService.getTrending).mockResolvedValue(mockContent);

      await controller.getTrending(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getTrending).toHaveBeenCalledWith('movie', 'day', 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockContent,
        meta: {
          page: 1,
          limit: 20,
          totalResults: 20,
        },
        timestamp: expect.any(String),
        path: '/api/content/trending',
      });
    });

    it('should return trending TV shows with custom parameters', async () => {
      mockRequest.query = { type: 'tv', time_window: 'week', page: '2' };
      vi.mocked(contentService.getTrending).mockResolvedValue(mockContent);

      await controller.getTrending(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getTrending).toHaveBeenCalledWith('tv', 'week', 2);
    });

    it('should handle invalid content type', async () => {
      mockRequest.query = { type: 'invalid' };

      await controller.getTrending(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VALIDATION_ERROR',
          message: 'Content type must be either "movie" or "tv"',
          statusCode: 400,
        })
      );
    });

    it('should handle invalid page number', async () => {
      mockRequest.query = { page: 'invalid' };

      await controller.getTrending(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VALIDATION_ERROR',
          message: 'Page must be a number between 1 and 1000',
          statusCode: 400,
        })
      );
    });
  });

  describe('getPopular', () => {
    const mockContent: Content[] = [
      {
        id: 2,
        title: 'Popular Movie',
        overview: 'Popular overview',
        poster_path: '/popular.jpg',
        backdrop_path: '/popular-backdrop.jpg',
        release_date: '2023-02-01',
        vote_average: 7.8,
        vote_count: 800,
        popularity: 90,
        genre_ids: [35, 18],
        media_type: 'movie',
        adult: false,
        original_language: 'en',
      },
    ];

    it('should return popular movies with default parameters', async () => {
      vi.mocked(contentService.getPopular).mockResolvedValue(mockContent);

      await controller.getPopular(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getPopular).toHaveBeenCalledWith('movie', 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockContent,
        meta: {
          page: 1,
          limit: 20,
          totalResults: 20,
        },
        timestamp: expect.any(String),
        path: '/api/content/trending',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      vi.mocked(contentService.getPopular).mockRejectedValue(error);

      await controller.getPopular(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});