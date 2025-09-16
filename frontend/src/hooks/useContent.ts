import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';
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
};

// Hook for trending content
export function useTrending(type: 'movie' | 'tv', page: number = 1) {
  return useQuery({
    queryKey: [...contentKeys.trending(type), page],
    queryFn: () => contentService.getTrending(type, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for popular content
export function usePopular(type: 'movie' | 'tv', page: number = 1) {
  return useQuery({
    queryKey: [...contentKeys.popular(type), page],
    queryFn: () => contentService.getPopular(type, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for content details
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