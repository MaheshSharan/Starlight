import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Content, ContentDetails, Genre } from '@/types/content.types';

interface ContentState {
  // Trending content
  trendingMovies: Content[];
  trendingTvShows: Content[];

  // Popular content
  popularMovies: Content[];
  popularTvShows: Content[];

  // Top-rated content
  topRatedMovies: Content[];
  topRatedTvShows: Content[];

  // Content details
  currentContent: ContentDetails | null;

  // Genres
  movieGenres: Genre[];
  tvGenres: Genre[];

  // Loading states
  isLoadingTrending: boolean;
  isLoadingPopular: boolean;
  isLoadingDetails: boolean;
  isLoadingGenres: boolean;

  // Error states
  trendingError: string | null;
  popularError: string | null;
  detailsError: string | null;
  genresError: string | null;

  // Actions
  setTrendingMovies: (movies: Content[]) => void;
  setTrendingTvShows: (tvShows: Content[]) => void;
  setPopularMovies: (movies: Content[]) => void;
  setPopularTvShows: (tvShows: Content[]) => void;
  setTopRatedMovies: (movies: Content[]) => void;
  setTopRatedTvShows: (tvShows: Content[]) => void;
  setCurrentContent: (content: ContentDetails | null) => void;
  setMovieGenres: (genres: Genre[]) => void;
  setTvGenres: (genres: Genre[]) => void;

  // Loading actions
  setLoadingTrending: (loading: boolean) => void;
  setLoadingPopular: (loading: boolean) => void;
  setLoadingDetails: (loading: boolean) => void;
  setLoadingGenres: (loading: boolean) => void;

  // Error actions
  setTrendingError: (error: string | null) => void;
  setPopularError: (error: string | null) => void;
  setDetailsError: (error: string | null) => void;
  setGenresError: (error: string | null) => void;

  // Utility actions
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  trendingMovies: [],
  trendingTvShows: [],
  popularMovies: [],
  popularTvShows: [],
  topRatedMovies: [],
  topRatedTvShows: [],
  currentContent: null,
  movieGenres: [],
  tvGenres: [],
  isLoadingTrending: false,
  isLoadingPopular: false,
  isLoadingDetails: false,
  isLoadingGenres: false,
  trendingError: null,
  popularError: null,
  detailsError: null,
  genresError: null,
};

export const useContentStore = create<ContentState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Content setters
      setTrendingMovies: (movies) => set({ trendingMovies: movies }),
      setTrendingTvShows: (tvShows) => set({ trendingTvShows: tvShows }),
      setPopularMovies: (movies) => set({ popularMovies: movies }),
      setPopularTvShows: (tvShows) => set({ popularTvShows: tvShows }),
      setTopRatedMovies: (movies) => set({ topRatedMovies: movies }),
      setTopRatedTvShows: (tvShows) => set({ topRatedTvShows: tvShows }),
      setCurrentContent: (content) => set({ currentContent: content }),
      setMovieGenres: (genres) => set({ movieGenres: genres }),
      setTvGenres: (genres) => set({ tvGenres: genres }),

      // Loading setters
      setLoadingTrending: (loading) => set({ isLoadingTrending: loading }),
      setLoadingPopular: (loading) => set({ isLoadingPopular: loading }),
      setLoadingDetails: (loading) => set({ isLoadingDetails: loading }),
      setLoadingGenres: (loading) => set({ isLoadingGenres: loading }),

      // Error setters
      setTrendingError: (error) => set({ trendingError: error }),
      setPopularError: (error) => set({ popularError: error }),
      setDetailsError: (error) => set({ detailsError: error }),
      setGenresError: (error) => set({ genresError: error }),

      // Utility actions
      clearErrors: () => set({
        trendingError: null,
        popularError: null,
        detailsError: null,
        genresError: null,
      }),

      reset: () => set(initialState),
    }),
    {
      name: 'content-store',
    }
  )
);