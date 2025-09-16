// Search and Filter Types

import { Content, ContentType } from './content.types';

// Search Filter interface
export interface SearchFilters {
  genre?: number[];
  year?: number;
  rating?: number;
  type?: ContentType;
  sort_by?: SortBy;
  sort_order?: SortOrder;
  include_adult?: boolean;
  language?: string;
  region?: string;
  with_genres?: string; // Comma-separated genre IDs
  without_genres?: string; // Comma-separated genre IDs
  with_companies?: string; // Comma-separated company IDs
  with_keywords?: string; // Comma-separated keyword IDs
  primary_release_year?: number; // For movies
  first_air_date_year?: number; // For TV shows
  vote_average_gte?: number; // Minimum rating
  vote_average_lte?: number; // Maximum rating
  vote_count_gte?: number; // Minimum vote count
  runtime_gte?: number; // Minimum runtime (minutes)
  runtime_lte?: number; // Maximum runtime (minutes)
}

// Sort options
export type SortBy = 
  | 'popularity.desc'
  | 'popularity.asc'
  | 'release_date.desc'
  | 'release_date.asc'
  | 'revenue.desc'
  | 'revenue.asc'
  | 'primary_release_date.desc'
  | 'primary_release_date.asc'
  | 'original_title.desc'
  | 'original_title.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'vote_count.desc'
  | 'vote_count.asc'
  | 'first_air_date.desc'
  | 'first_air_date.asc';

export type SortOrder = 'asc' | 'desc';

// Search Query Parameters
export interface SearchParams {
  query: string;
  page?: number;
  include_adult?: boolean;
  region?: string;
  year?: number;
  primary_release_year?: number;
  first_air_date_year?: number;
}

// Multi-search parameters (searches across movies, TV shows, and people)
export interface MultiSearchParams extends Omit<SearchParams, 'year' | 'primary_release_year' | 'first_air_date_year'> {
  // Multi-search doesn't support year filtering
}

// Search Result interface
export interface SearchResult {
  results: Content[];
  page: number;
  total_pages: number;
  total_results: number;
  query: string;
  filters?: SearchFilters;
}

// Search Suggestion interface
export interface SearchSuggestion {
  id: number;
  title: string;
  media_type: ContentType;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
}

// Search Analytics interface for tracking popular queries
export interface SearchAnalytics {
  id?: number;
  query: string;
  filters?: SearchFilters;
  results_count: number;
  created_at?: Date;
}

// Discover Parameters (for content discovery without search query)
export interface DiscoverParams {
  sort_by?: SortBy;
  page?: number;
  with_genres?: string;
  without_genres?: string;
  with_companies?: string;
  with_keywords?: string;
  with_people?: string;
  release_date_gte?: string;
  release_date_lte?: string;
  first_air_date_gte?: string;
  first_air_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  runtime_gte?: number;
  runtime_lte?: number;
  with_original_language?: string;
  include_adult?: boolean;
  include_video?: boolean;
  primary_release_year?: number;
  first_air_date_year?: number;
  region?: string;
  certification_country?: string;
  certification?: string;
  certification_lte?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_watch_monetization_types?: string;
}

// Filter Options for UI
export interface FilterOptions {
  genres: Array<{ id: number; name: string }>;
  years: number[];
  ratings: Array<{ value: number; label: string }>;
  sortOptions: Array<{ value: SortBy; label: string }>;
}

// Search Request interface for API endpoints
export interface SearchRequest {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

// Advanced Search interface for complex queries
export interface AdvancedSearchParams extends SearchParams {
  filters: SearchFilters;
  discover?: DiscoverParams;
}