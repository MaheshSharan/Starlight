// TMDB Content Types based on API structure

// Base Content interface from TMDB API
export interface Content {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  original_title?: string; // For movies
  original_name?: string; // For TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  adult: boolean;
  original_language: string;
  video?: boolean; // For movies
}

// Genre interface
export interface Genre {
  id: number;
  name: string;
}

// Production Company interface
export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// Production Country interface
export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Spoken Language interface
export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Cast Member interface
export interface CastMember {
  id: number;
  name: string;
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number | null;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

// Crew Member interface
export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  credit_id: string;
  adult: boolean;
  gender: number | null;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

// Credits interface
export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

// Season interface for TV shows
export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

// Episode interface for TV shows
export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

// Extended Content Details interface
export interface ContentDetails extends Omit<Content, 'genre_ids'> {
  genres: Genre[];
  runtime?: number; // For movies (in minutes)
  number_of_seasons?: number; // For TV shows
  number_of_episodes?: number; // For TV shows
  episode_run_time?: number[]; // For TV shows
  seasons?: Season[]; // For TV shows
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  credits: Credits;
  similar: Content[];
  recommendations: Content[];
  homepage?: string;
  imdb_id?: string;
  status: string;
  tagline?: string;
  budget?: number; // For movies
  revenue?: number; // For movies
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  created_by?: Array<{
    id: number;
    name: string;
    gender: number | null;
    profile_path: string | null;
  }>; // For TV shows
  networks?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>; // For TV shows
  last_air_date?: string; // For TV shows
  next_episode_to_air?: Episode | null; // For TV shows
  last_episode_to_air?: Episode | null; // For TV shows
  in_production?: boolean; // For TV shows
  type?: string; // For TV shows
}

// TMDB API Response interfaces
export interface TMDBResponse<T> {
  page?: number;
  results: T[];
  total_pages?: number;
  total_results?: number;
}

// Content Collection Response
export interface ContentCollection {
  results: Content[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Trending Time Window
export type TrendingTimeWindow = 'day' | 'week';

// Content Type for API endpoints
export type ContentType = 'movie' | 'tv';

// Content Status for tracking
export enum ContentStatus {
  RUMORED = 'Rumored',
  PLANNED = 'Planned',
  IN_PRODUCTION = 'In Production',
  POST_PRODUCTION = 'Post Production',
  RELEASED = 'Released',
  CANCELED = 'Canceled',
  // TV Show specific statuses
  RETURNING_SERIES = 'Returning Series',
  PILOT = 'Pilot',
  ENDED = 'Ended'
}