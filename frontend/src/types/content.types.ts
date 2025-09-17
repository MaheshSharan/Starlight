// Content types for our streaming platform API
export interface Content {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
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
}

export interface ContentDetails extends Content {
  genres: Genre[];
  runtime?: number; // For movies
  number_of_seasons?: number; // For TV shows
  number_of_episodes?: number; // For TV shows
  seasons?: Season[]; // For TV shows
  episode_run_time?: number[]; // For TV shows
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  credits: Credits;
  similar: Content[];
  recommendations: Content[];
  tagline?: string;
  homepage?: string;
  budget?: number;
  revenue?: number;
  status: string;
  // Additional TV show specific fields
  created_by?: Array<{
    id: number;
    name: string;
    profile_path: string | null;
  }>;
  last_air_date?: string;
  next_episode_to_air?: Episode | null;
  last_episode_to_air?: Episode | null;
  in_production?: boolean;
  type?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// Search and filter types
export interface SearchFilters {
  genre?: number[];
  year?: number;
  rating?: number;
  type?: 'movie' | 'tv';
  sort_by?: 'popularity' | 'release_date' | 'vote_average';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  results: Content[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Streaming types
export interface StreamSource {
  url: string;
  quality: '480p' | '720p' | '1080p' | '4K';
  type: 'mp4' | 'hls' | 'dash';
  provider: string;
}

export interface Subtitle {
  url: string;
  language: string;
  label: string;
  default: boolean;
}

export interface PlayerData {
  content: ContentDetails;
  sources: StreamSource[];
  subtitles: Subtitle[];
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