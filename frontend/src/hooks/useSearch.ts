import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';
import { SearchFilters, SearchResult } from '@/types/content.types';
import { useSearchStore } from '@/stores/search.store';
import { useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

// Query keys for search
export const searchKeys = {
  all: ['search'] as const,
  results: (query: string, filters?: SearchFilters, page?: number) => 
    [...searchKeys.all, 'results', query, filters, page] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
};

// Hook for search results
export function useSearchResults(query: string, filters?: SearchFilters, page: number = 1) {
  return useQuery({
    queryKey: searchKeys.results(query, filters, page),
    queryFn: () => contentService.search(query, filters, page),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for infinite search results
export function useInfiniteSearch(query: string, filters?: SearchFilters) {
  return useInfiniteQuery({
    queryKey: searchKeys.results(query, filters),
    queryFn: ({ pageParam = 1 }) => contentService.search(query, filters, pageParam),
    getNextPageParam: (lastPage: SearchResult) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for search suggestions
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: async () => {
      if (!query.trim()) return [];
      
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
      }
    },
    enabled: !!query.trim() && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Custom hook that integrates search with Zustand store
export function useSearch() {
  const {
    query,
    filters,
    results,
    currentPage,
    totalPages,
    totalResults,
    isLoading,
    error,
    searchHistory,
    setQuery,
    setResults,
    setFilters,
    setPagination,
    setLoading,
    setError,
    addToHistory,
    clearResults,
    updateFilter,
    clearFilters,
  } = useSearchStore();

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300);

  // Search results query
  const searchQuery = useSearchResults(debouncedQuery, filters, currentPage);

  // Update store when query results change
  useEffect(() => {
    if (searchQuery.data) {
      setResults(searchQuery.data.results);
      setPagination(
        searchQuery.data.page,
        searchQuery.data.total_pages,
        searchQuery.data.total_results
      );
    }
    setLoading(searchQuery.isLoading);
    setError(searchQuery.error?.message || null);
  }, [searchQuery.data, searchQuery.isLoading, searchQuery.error, setResults, setPagination, setLoading, setError]);

  // Search function
  const search = useCallback((newQuery: string, newFilters?: SearchFilters) => {
    if (newQuery.trim()) {
      addToHistory(newQuery.trim());
    }
    setQuery(newQuery);
    if (newFilters) {
      setFilters(newFilters);
    }
    clearResults();
  }, [setQuery, setFilters, addToHistory, clearResults]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    clearResults();
    clearFilters();
  }, [setQuery, clearResults, clearFilters]);

  // Load more results (for pagination)
  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      // This would trigger a new query with the next page
      // Implementation depends on how pagination is handled
    }
  }, [currentPage, totalPages, isLoading]);

  return {
    // State
    query,
    filters,
    results,
    currentPage,
    totalPages,
    totalResults,
    isLoading,
    error,
    searchHistory,
    
    // Actions
    search,
    clearSearch,
    loadMore,
    setQuery,
    updateFilter,
    clearFilters,
    
    // Query state
    isSearching: searchQuery.isLoading,
    searchError: searchQuery.error,
    refetch: searchQuery.refetch,
  };
}