import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { searchService } from '../services/search.service.js';
import { SearchResult } from '../types/search.types.js';

// Mock the search service
vi.mock('@/services/search.service.js', () => ({
  searchService: {
    search: vi.fn(),
    searchMovies: vi.fn(),
    searchTVShows: vi.fn(),
    advancedSearch: vi.fn(),
    getSearchSuggestions: vi.fn(),
    getPopularQueries: vi.fn(),
  },
}));

describe('SearchController', () => {
  let controller: SearchController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new SearchController();
    mockRequest = {
      query: {},
      originalUrl: '/api/search',
    };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('search', () => {
    const mockSearchResult: SearchResult = {
      results: [
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
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
      query: 'test',
    };

    it('should return search results with valid query', async () => {
      mockRequest.query = { q: 'test' };
      vi.mocked(searchService.search).mockResolvedValue(mockSearchResult);

      await controller.search(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(searchService.search).toHaveBeenCalledWith({
        query: 'test',
        page: 1,
        include_adult: false,
        region: undefined,
        year: undefined,
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSearchResult.results,
        meta: {
          page: 1,
          totalPages: 1,
          totalResults: 1,
          query: 'test',
          filters: undefined,
        },
        timestamp: expect.any(String),
        path: '/api/search',
      });
    });

    it('should handle missing query parameter', async () => {
      mockRequest.query = {};

      await controller.search(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VALIDATION_ERROR',
          message: 'Search query is required',
          statusCode: 400,
        })
      );
    });

    it('should handle invalid page number', async () => {
      mockRequest.query = { q: 'test', page: 'invalid' };

      await controller.search(
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

    it('should handle search with filters', async () => {
      mockRequest.query = { 
        q: 'test', 
        type: 'movie', 
        genre: '28,12', 
        rating: '7.5' 
      };
      vi.mocked(searchService.advancedSearch).mockResolvedValue(mockSearchResult);

      await controller.search(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(searchService.advancedSearch).toHaveBeenCalled();
    });
  });

  describe('searchMovies', () => {
    const mockMovieResult: SearchResult = {
      results: [
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
      ],
      page: 1,
      total_pages: 1,
      total_results: 1,
      query: 'test movie',
    };

    it('should return movie search results', async () => {
      mockRequest.query = { q: 'test movie' };
      vi.mocked(searchService.searchMovies).mockResolvedValue(mockMovieResult);

      await controller.searchMovies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(searchService.searchMovies).toHaveBeenCalledWith({
        query: 'test movie',
        page: 1,
        include_adult: false,
        region: undefined,
        year: undefined,
        primary_release_year: undefined,
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockMovieResult.results,
        meta: {
          page: 1,
          totalPages: 1,
          totalResults: 1,
          query: 'test movie',
          filters: undefined,
        },
        timestamp: expect.any(String),
        path: '/api/search',
      });
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const mockSuggestions = [
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
          media_type: 'movie' as const,
          adult: false,
          original_language: 'en',
        },
      ];

      mockRequest.query = { q: 'test' };
      vi.mocked(searchService.getSearchSuggestions).mockResolvedValue(mockSuggestions);

      await controller.getSearchSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(searchService.getSearchSuggestions).toHaveBeenCalledWith('test', 5);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSuggestions,
        meta: {
          query: 'test',
          limit: 5,
          count: 1,
        },
        timestamp: expect.any(String),
        path: '/api/search',
      });
    });
  });

  describe('getPopularQueries', () => {
    it('should return popular queries', async () => {
      const mockQueries = ['avengers', 'batman', 'spider-man'];
      vi.mocked(searchService.getPopularQueries).mockResolvedValue(mockQueries);

      await controller.getPopularQueries(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(searchService.getPopularQueries).toHaveBeenCalledWith(10);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQueries,
        meta: {
          limit: 10,
          count: 3,
        },
        timestamp: expect.any(String),
        path: '/api/search',
      });
    });
  });
});