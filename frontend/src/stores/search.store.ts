import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Content, SearchFilters } from '@/types/content.types';

interface SearchState {
  // Search data
  query: string;
  results: Content[];
  filters: SearchFilters;
  suggestions: string[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalResults: number;
  
  // Loading and error states
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  
  // Search history
  searchHistory: string[];
  
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: Content[]) => void;
  setFilters: (filters: SearchFilters) => void;
  setSuggestions: (suggestions: string[]) => void;
  setPagination: (page: number, totalPages: number, totalResults: number) => void;
  
  // Loading and error actions
  setLoading: (loading: boolean) => void;
  setLoadingSuggestions: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // History actions
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  
  // Filter actions
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  
  // Utility actions
  reset: () => void;
  clearResults: () => void;
}

const initialFilters: SearchFilters = {
  genre: [],
  year: undefined,
  rating: undefined,
  type: undefined,
  sort_by: 'popularity',
  sort_order: 'desc',
};

const initialState = {
  query: '',
  results: [],
  filters: initialFilters,
  suggestions: [],
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  isLoading: false,
  isLoadingSuggestions: false,
  error: null,
  searchHistory: [],
};

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Basic setters
      setQuery: (query) => set({ query }),
      setResults: (results) => set({ results }),
      setFilters: (filters) => set({ filters }),
      setSuggestions: (suggestions) => set({ suggestions }),
      setPagination: (page, totalPages, totalResults) => set({
        currentPage: page,
        totalPages,
        totalResults,
      }),
      
      // Loading and error setters
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingSuggestions: (loading) => set({ isLoadingSuggestions: loading }),
      setError: (error) => set({ error }),
      
      // History actions
      addToHistory: (query) => {
        const { searchHistory } = get();
        const trimmedQuery = query.trim();
        
        if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
          const newHistory = [trimmedQuery, ...searchHistory.slice(0, 9)]; // Keep last 10
          set({ searchHistory: newHistory });
        }
      },
      
      clearHistory: () => set({ searchHistory: [] }),
      
      // Filter actions
      updateFilter: (key, value) => {
        const { filters } = get();
        set({
          filters: {
            ...filters,
            [key]: value,
          },
        });
      },
      
      clearFilters: () => set({ filters: initialFilters }),
      
      // Utility actions
      reset: () => set(initialState),
      
      clearResults: () => set({
        results: [],
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        error: null,
      }),
    }),
    {
      name: 'search-store',
    }
  )
);