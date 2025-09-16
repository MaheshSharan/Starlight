import { apiService } from './api.service';
import { 
  Content, 
  ContentDetails, 
  SearchResult, 
  SearchFilters, 
  Genre 
} from '@/types/content.types';
import { PaginatedResponse } from '@/types/api.types';

class ContentService {
  // Get trending content
  async getTrending(type: 'movie' | 'tv', page: number = 1): Promise<PaginatedResponse<Content>> {
    return apiService.get<PaginatedResponse<Content>>(`/api/content/trending?type=${type}&page=${page}`);
  }

  // Get popular content
  async getPopular(type: 'movie' | 'tv', page: number = 1): Promise<PaginatedResponse<Content>> {
    return apiService.get<PaginatedResponse<Content>>(`/api/content/popular?type=${type}&page=${page}`);
  }

  // Get content details
  async getDetails(type: 'movie' | 'tv', id: number): Promise<ContentDetails> {
    return apiService.get<ContentDetails>(`/api/content/${type}/${id}`);
  }

  // Search content
  async search(query: string, filters?: SearchFilters, page: number = 1): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
    });

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.genre && filters.genre.length > 0) {
        params.append('genre', filters.genre.join(','));
      }
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }

    return apiService.get<SearchResult>(`/api/search?${params.toString()}`);
  }

  // Get genres
  async getGenres(type: 'movie' | 'tv'): Promise<Genre[]> {
    return apiService.get<Genre[]>(`/api/content/genres?type=${type}`);
  }

  // Get similar content
  async getSimilar(type: 'movie' | 'tv', id: number, page: number = 1): Promise<PaginatedResponse<Content>> {
    return apiService.get<PaginatedResponse<Content>>(`/api/content/${type}/${id}/similar?page=${page}`);
  }

  // Get recommendations
  async getRecommendations(type: 'movie' | 'tv', id: number, page: number = 1): Promise<PaginatedResponse<Content>> {
    return apiService.get<PaginatedResponse<Content>>(`/api/content/${type}/${id}/recommendations?page=${page}`);
  }

  // Utility methods
  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-image.jpg';
    // Image URLs should be provided by our backend API, not constructed on frontend
    // The backend will handle external image URL construction and potentially proxy/cache images
    return `/api/images/${size}${path}`;
  }

  getTitle(content: Content): string {
    return content.title || content.name || 'Unknown Title';
  }

  getReleaseDate(content: Content): string {
    return content.release_date || content.first_air_date || '';
  }

  getReleaseYear(content: Content): number | null {
    const date = this.getReleaseDate(content);
    return date ? new Date(date).getFullYear() : null;
  }
}

// Create and export a singleton instance
export const contentService = new ContentService();
export default contentService;