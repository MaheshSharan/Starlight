import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { contentService } from '../services/content.service.js';
import { ContentDetails, Content } from '../types/content.types.js';

// Mock the content service
vi.mock('@/services/content.service.js', () => ({
  contentService: {
    getDetails: vi.fn(),
    getSimilar: vi.fn(),
    getRecommendations: vi.fn(),
    getCredits: vi.fn(),
  },
}));

describe('ContentController - Details Endpoints', () => {
  let controller: ContentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ContentController();
    mockRequest = {
      params: {},
      query: {},
      originalUrl: '/api/content/movie/123',
    };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('getContentDetails', () => {
    const mockContentDetails: ContentDetails = {
      id: 123,
      title: 'Test Movie',
      overview: 'Test overview',
      poster_path: '/test.jpg',
      backdrop_path: '/test-backdrop.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      vote_count: 1000,
      popularity: 100,
      media_type: 'movie',
      adult: false,
      original_language: 'en',
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ],
      runtime: 120,
      production_companies: [],
      production_countries: [],
      spoken_languages: [],
      credits: { cast: [], crew: [] },
      similar: [],
      recommendations: [],
      homepage: 'https://example.com',
      status: 'Released',
    };

    it('should return content details for valid movie ID', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      vi.mocked(contentService.getDetails).mockResolvedValue(mockContentDetails);

      await controller.getContentDetails(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getDetails).toHaveBeenCalledWith('movie', 123);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockContentDetails,
        meta: {
          contentType: 'movie',
          contentId: 123,
        },
        timestamp: expect.any(String),
        path: '/api/content/movie/123',
      });
    });

    it('should return content details for valid TV show ID', async () => {
      mockRequest.params = { type: 'tv', id: '456' };
      mockRequest.originalUrl = '/api/content/tv/456';
      vi.mocked(contentService.getDetails).mockResolvedValue({
        ...mockContentDetails,
        id: 456,
        name: 'Test TV Show',
        media_type: 'tv',
      });

      await controller.getContentDetails(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getDetails).toHaveBeenCalledWith('tv', 456);
    });

    it('should handle service errors', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      const error = new Error('Content not found');
      vi.mocked(contentService.getDetails).mockRejectedValue(error);

      await controller.getContentDetails(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSimilarContent', () => {
    const mockSimilarContent: Content[] = [
      {
        id: 124,
        title: 'Similar Movie',
        overview: 'Similar overview',
        poster_path: '/similar.jpg',
        backdrop_path: '/similar-backdrop.jpg',
        release_date: '2023-02-01',
        vote_average: 7.8,
        vote_count: 800,
        popularity: 90,
        genre_ids: [28, 12],
        media_type: 'movie',
        adult: false,
        original_language: 'en',
      },
    ];

    it('should return similar content with default pagination', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      mockRequest.originalUrl = '/api/content/movie/123/similar';
      vi.mocked(contentService.getSimilar).mockResolvedValue(mockSimilarContent);

      await controller.getSimilarContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getSimilar).toHaveBeenCalledWith('movie', 123, 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSimilarContent,
        meta: {
          page: 1,
          contentType: 'movie',
          contentId: 123,
          limit: 20,
        },
        timestamp: expect.any(String),
        path: '/api/content/movie/123/similar',
      });
    });

    it('should return similar content with custom page', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      mockRequest.query = { page: '2' };
      vi.mocked(contentService.getSimilar).mockResolvedValue(mockSimilarContent);

      await controller.getSimilarContent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getSimilar).toHaveBeenCalledWith('movie', 123, 2);
    });

    it('should handle invalid page number', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      mockRequest.query = { page: 'invalid' };

      await controller.getSimilarContent(
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

  describe('getRecommendations', () => {
    const mockRecommendations: Content[] = [
      {
        id: 125,
        title: 'Recommended Movie',
        overview: 'Recommended overview',
        poster_path: '/recommended.jpg',
        backdrop_path: '/recommended-backdrop.jpg',
        release_date: '2023-03-01',
        vote_average: 8.2,
        vote_count: 900,
        popularity: 95,
        genre_ids: [28, 12],
        media_type: 'movie',
        adult: false,
        original_language: 'en',
      },
    ];

    it('should return recommendations with default pagination', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      mockRequest.originalUrl = '/api/content/movie/123/recommendations';
      vi.mocked(contentService.getRecommendations).mockResolvedValue(mockRecommendations);

      await controller.getRecommendations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getRecommendations).toHaveBeenCalledWith('movie', 123, 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
        meta: {
          page: 1,
          contentType: 'movie',
          contentId: 123,
          limit: 20,
        },
        timestamp: expect.any(String),
        path: '/api/content/movie/123/recommendations',
      });
    });
  });

  describe('getContentCredits', () => {
    const mockCredits = {
      cast: [
        {
          id: 1,
        name: 'John Doe',
          character: 'Main Character',
          credit_id: 'credit123',
          order: 0,
          adult: false,
          gender: 2,
          known_for_department: 'Acting',
          original_name: 'John Doe',
          popularity: 85.5,
          profile_path: '/john-doe.jpg',
        },
      ],
      crew: [
        {
          id: 2,
          name: 'Jane Smith',
          job: 'Director',
          department: 'Directing',
          credit_id: 'credit456',
          adult: false,
          gender: 1,
          known_for_department: 'Directing',
          original_name: 'Jane Smith',
          popularity: 75.2,
          profile_path: '/jane-smith.jpg',
        },
      ],
    };

    it('should return content credits', async () => {
      mockRequest.params = { type: 'movie', id: '123' };
      mockRequest.originalUrl = '/api/content/movie/123/credits';
      vi.mocked(contentService.getCredits).mockResolvedValue(mockCredits);

      await controller.getContentCredits(
    mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(contentService.getCredits).toHaveBeenCalledWith('movie', 123);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCredits,
        meta: {
          contentType: 'movie',
          contentId: 123,
        },
        timestamp: expect.any(String),
        path: '/api/content/movie/123/credits',
      });
    });
  });
});