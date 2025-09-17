import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { contentService } from '@/services/content.service';
import { useContentStore } from '@/stores/content.store';
import { Content } from '@/types/content.types';
import { PaginatedResponse } from '@/types/api.types';

// Query keys
export const contentKeys = {
  all: ['content'] as const,
  trending: (type: 'movie' | 'tv') => [...contentKeys.all, 'trending', type] as const,
  popular: (type: 'movie' | 'tv') => [...contentKeys.all, 'popular', type] as const,
  details: (type: 'movie' | 'tv', id: number) => [...contentKeys.all, 'details', type, id] as const,
  genres: (type: 'movie' | 'tv') => [...contentKeys.all, 'genres', type] as const,
  similar: (type: 'movie' | 'tv', id: number) => [...contentKeys.all, 'similar', type, id] as const,
  recommendations: (type: 'movie' | 'tv', id: number) => [...contentKeys.all, 'recommendations', type, id] as const,
  season: (tvId: number, seasonNumber: number) => [...contentKeys.all, 'season', tvId, seasonNumber] as const,
  episode: (tvId: number, seasonNumber: number, episodeNumber: number) => [...contentKeys.all, 'episode', tvId, seasonNumber, episodeNumber] as const,
};

// Main content hook that integrates with Zustand store
export function useContent() {
  const {
    setTrendingMovies,
    setTrendingTvShows,
    setPopularMovies,
    setPopularTvShows,
    setTopRatedMovies,
    setTopRatedTvShows,
    setCurrentContent,
    setLoadingTrending,
    setLoadingPopular,
    setLoadingDetails,
    setTrendingError,
    setPopularError,
    setDetailsError,
  } = useContentStore();

  const fetchTrending = useCallback(async (type: 'movie' | 'tv', page: number = 1) => {
    try {
      setLoadingTrending(true);
      setTrendingError(null);
      
      const response = await contentService.getTrending(type, page);
      
      if (type === 'movie') {
        setTrendingMovies(response.results);
      } else {
        setTrendingTvShows(response.results);
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch trending ${type}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch trending ${type}`;
      setTrendingError(errorMessage);
      
      // Set empty arrays on error to prevent stale data
      if (type === 'movie') {
        setTrendingMovies([]);
      } else {
        setTrendingTvShows([]);
      }
      
      throw error;
    } finally {
      setLoadingTrending(false);
    }
  }, [setTrendingMovies, setTrendingTvShows, setLoadingTrending, setTrendingError]);

  const fetchPopular = useCallback(async (type: 'movie' | 'tv', page: number = 1) => {
    try {
      setLoadingPopular(true);
      setPopularError(null);
      
      const response = await contentService.getPopular(type, page);
      
      if (type === 'movie') {
        setPopularMovies(response.results);
      } else {
        setPopularTvShows(response.results);
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch popular ${type}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch popular ${type}`;
      setPopularError(errorMessage);
      
      // Set empty arrays on error to prevent stale data
      if (type === 'movie') {
        setPopularMovies([]);
      } else {
        setPopularTvShows([]);
      }
      
      throw error;
    } finally {
      setLoadingPopular(false);
    }
  }, [setPopularMovies, setPopularTvShows, setLoadingPopular, setPopularError]);

  const fetchTopRated = useCallback(async (type: 'movie' | 'tv', page: number = 1) => {
    try {
      setLoadingPopular(true); // Reuse popular loading state for top-rated
      setPopularError(null);
      
      const response = await contentService.getTopRated(type, page);
      
      if (type === 'movie') {
        setTopRatedMovies(response.results);
      } else {
        setTopRatedTvShows(response.results);
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch top-rated ${type}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch top-rated ${type}`;
      setPopularError(errorMessage);
      
      // Set empty arrays on error to prevent stale data
      if (type === 'movie') {
        setTopRatedMovies([]);
      } else {
        setTopRatedTvShows([]);
      }
      
      throw error;
    } finally {
      setLoadingPopular(false);
    }
  }, [setTopRatedMovies, setTopRatedTvShows, setLoadingPopular, setPopularError]);

  const fetchDetails = useCallback(async (type: 'movie' | 'tv', id: number) => {
    try {
      setLoadingDetails(true);
      setDetailsError(null);
      
      const response = await contentService.getDetails(type, id);
      setCurrentContent(response);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content details';
      setDetailsError(errorMessage);
      throw error;
    } finally {
      setLoadingDetails(false);
    }
  }, [setCurrentContent, setLoadingDetails, setDetailsError]);

  return {
    fetchTrending,
    fetchPopular,
    fetchTopRated,
    fetchDetails,
  };
}

// Hook for trending content (React Query)
export function useTrendingQuery(type: 'movie' | 'tv', page: number = 1) {
  return useQuery({
    queryKey: [...contentKeys.trending(type), page],
    queryFn: () => contentService.getTrending(type, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for popular content (React Query)
export function usePopularQuery(type: 'movie' | 'tv', page: number = 1) {
  return useQuery({
    queryKey: [...contentKeys.popular(type), page],
    queryFn: () => contentService.getPopular(type, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for top-rated content (React Query)
export function useTopRatedQuery(type: 'movie' | 'tv', page: number = 1) {
  return useQuery({
    queryKey: [...contentKeys.all, 'top-rated', type, page],
    queryFn: () => contentService.getTopRated(type, page),
    staleTime: 15 * 60 * 1000, // 15 minutes (top-rated changes less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for content details (React Query)
export function useContentDetails(type: 'movie' | 'tv', id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: contentKeys.details(type, id),
    queryFn: () => contentService.getDetails(type, id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for genres
export function useGenres(type: 'movie' | 'tv') {
  return useQuery({
    queryKey: contentKeys.genres(type),
    queryFn: () => contentService.getGenres(type),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Hook for similar content
export function useSimilar(type: 'movie' | 'tv', id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: contentKeys.similar(type, id),
    queryFn: () => contentService.getSimilar(type, id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for recommendations
export function useRecommendations(type: 'movie' | 'tv', id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: contentKeys.recommendations(type, id),
    queryFn: () => contentService.getRecommendations(type, id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for infinite trending content (for infinite scroll)
export function useInfiniteTrending(type: 'movie' | 'tv') {
  return useInfiniteQuery({
    queryKey: contentKeys.trending(type),
    queryFn: ({ pageParam = 1 }) => contentService.getTrending(type, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Content>) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for infinite popular content
export function useInfinitePopular(type: 'movie' | 'tv') {
  return useInfiniteQuery({
    queryKey: contentKeys.popular(type),
    queryFn: ({ pageParam = 1 }) => contentService.getPopular(type, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Content>) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for TV show season details
export function useSeasonDetails(tvId: number, seasonNumber: number, enabled: boolean = true) {
  return useQuery({
    queryKey: contentKeys.season(tvId, seasonNumber),
    queryFn: () => contentService.getSeasonDetails(tvId, seasonNumber),
    enabled: enabled && !!tvId && !!seasonNumber,
    staleTime: 30 * 60 * 1000, // 30 minutes - season data doesn't change often
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
}

// Hook for TV show episode details
export function useEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number, enabled: boolean = true) {
  return useQuery({
    queryKey: contentKeys.episode(tvId, seasonNumber, episodeNumber),
    queryFn: () => contentService.getEpisodeDetails(tvId, seasonNumber, episodeNumber),
    enabled: enabled && !!tvId && !!seasonNumber && !!episodeNumber,
    staleTime: 30 * 60 * 1000, // 30 minutes - episode data doesn't change often
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
}