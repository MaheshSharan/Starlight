import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TMDBService } from '../services/tmdb.service.js';
import { ContentService } from '../services/content.service.js';

// Mock axios to avoid real API calls during tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));

// Mock Redis service
vi.mock('@/config/redis.js', () => ({
  redisService: {
    getClient: vi.fn(() => ({
      get: vi.fn(),
      setEx: vi.fn(),
      del: vi.fn(),
      keys: vi.fn(() => []),
      exists: vi.fn(),
      ttl: vi.fn(),
      expire: vi.fn(),
      info: vi.fn(() => 'used_memory_human:1.00M')
    })),
    isHealthy: vi.fn(() => true)
  }
}));

// Mock cache service
vi.mock('@/services/cache.service.js', () => ({
  CacheService: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    invalidate: vi.fn(),
    getStats: vi.fn(() => ({ connected: true, keyCount: 0 }))
  }))
}));

// Mock config
vi.mock('@/config/index.js', () => ({
  config: {
    tmdb: {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.themoviedb.org/3'
    },
    cache: {
      ttl: {
        trending: 3600,
        popular: 7200,
        contentDetails: 86400,
        searchResults: 1800,
        streamSources: 300,
        genres: 604800
      }
    }
  }
}));

describe('TMDB Service', () => {
  let tmdbService: TMDBService;

  beforeEach(() => {
    tmdbService = new TMDBService();
  });

  it('should create TMDB service instance', () => {
    expect(tmdbService).toBeDefined();
    expect(tmdbService).toBeInstanceOf(TMDBService);
  });

  it('should have all required methods', () => {
    expect(typeof tmdbService.getTrending).toBe('function');
    expect(typeof tmdbService.getPopular).toBe('function');
    expect(typeof tmdbService.getTopRated).toBe('function');
    expect(typeof tmdbService.getDetails).toBe('function');
    expect(typeof tmdbService.search).toBe('function');
    expect(typeof tmdbService.multiSearch).toBe('function');
    expect(typeof tmdbService.discover).toBe('function');
    expect(typeof tmdbService.getGenres).toBe('function');
    expect(typeof tmdbService.getCredits).toBe('function');
    expect(typeof tmdbService.getSimilar).toBe('function');
    expect(typeof tmdbService.getRecommendations).toBe('function');
    expect(typeof tmdbService.getImages).toBe('function');
    expect(typeof tmdbService.getVideos).toBe('function');
  });
});

describe('Content Service', () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = new ContentService();
  });

  it('should create content service instance', () => {
    expect(contentService).toBeDefined();
    expect(contentService).toBeInstanceOf(ContentService);
  });

  it('should have all required methods', () => {
    expect(typeof contentService.getTrending).toBe('function');
    expect(typeof contentService.getPopular).toBe('function');
    expect(typeof contentService.getTopRated).toBe('function');
    expect(typeof contentService.getDetails).toBe('function');
    expect(typeof contentService.getSimilar).toBe('function');
    expect(typeof contentService.getRecommendations).toBe('function');
    expect(typeof contentService.discover).toBe('function');
    expect(typeof contentService.getGenres).toBe('function');
    expect(typeof contentService.getCredits).toBe('function');
  });

  it('should have cache management methods', () => {
    expect(typeof contentService.invalidateTrendingCache).toBe('function');
    expect(typeof contentService.invalidatePopularCache).toBe('function');
    expect(typeof contentService.invalidateContentCache).toBe('function');
    expect(typeof contentService.refreshCache).toBe('function');
    expect(typeof contentService.getCacheStats).toBe('function');
  });
});