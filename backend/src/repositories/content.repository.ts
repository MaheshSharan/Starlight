import type { ContentCache, SearchAnalytics, ContentPopularity } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export interface CacheEntry {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  data: any;
  expiresAt: Date;
}

export interface SearchQuery {
  query: string;
  filters?: any;
  resultsCount?: number;
}

export interface PopularityUpdate {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}

export class ContentRepository extends BaseRepository {
  // Content Cache Operations
  async getCachedContent(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<ContentCache | null> {
    try {
      const cached = await this.prisma.contentCache.findUnique({
        where: {
          tmdbId_mediaType: {
            tmdbId,
            mediaType,
          },
        },
      });

      // Check if cache is expired
      if (cached && cached.expiresAt < new Date()) {
        await this.deleteCachedContent(tmdbId, mediaType);
        return null;
      }

      return cached;
    } catch (error) {
      this.handleError(error, 'getCachedContent');
    }
  }

  async setCachedContent(entry: CacheEntry): Promise<ContentCache> {
    try {
      return await this.prisma.contentCache.upsert({
        where: {
          tmdbId_mediaType: {
            tmdbId: entry.tmdbId,
            mediaType: entry.mediaType,
          },
        },
        update: {
          data: entry.data,
          expiresAt: entry.expiresAt,
          updatedAt: new Date(),
        },
        create: {
          tmdbId: entry.tmdbId,
          mediaType: entry.mediaType,
          data: entry.data,
          expiresAt: entry.expiresAt,
        },
      });
    } catch (error) {
      this.handleError(error, 'setCachedContent');
    }
  }

  async deleteCachedContent(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    try {
      await this.prisma.contentCache.delete({
        where: {
          tmdbId_mediaType: {
            tmdbId,
            mediaType,
          },
        },
      });
    } catch (error: any) {
      // Ignore if record doesn't exist
      if (error.code !== 'P2025') {
        this.handleError(error, 'deleteCachedContent');
      }
    }
  }

  async cleanExpiredCache(): Promise<number> {
    try {
      const result = await this.prisma.contentCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      this.handleError(error, 'cleanExpiredCache');
    }
  }

  // Search Analytics Operations
  async recordSearch(searchQuery: SearchQuery): Promise<SearchAnalytics> {
    try {
      return await this.prisma.searchAnalytics.create({
        data: {
          query: searchQuery.query,
          filters: searchQuery.filters,
          resultsCount: searchQuery.resultsCount,
        },
      });
    } catch (error) {
      this.handleError(error, 'recordSearch');
    }
  }

  async getPopularSearches(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      const result = await this.prisma.searchAnalytics.groupBy({
        by: ['query'],
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: limit,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      return result.map((item: { query: string; _count: { query: number } }) => ({
        query: item.query,
        count: item._count.query,
      }));
    } catch (error) {
      this.handleError(error, 'getPopularSearches');
    }
  }

  // Content Popularity Operations
  async updatePopularity(update: PopularityUpdate): Promise<ContentPopularity> {
    try {
      return await this.prisma.contentPopularity.upsert({
        where: {
          tmdbId_mediaType: {
            tmdbId: update.tmdbId,
            mediaType: update.mediaType,
          },
        },
        update: {
          viewCount: {
            increment: 1,
          },
          lastViewed: new Date(),
        },
        create: {
          tmdbId: update.tmdbId,
          mediaType: update.mediaType,
          viewCount: 1,
          lastViewed: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, 'updatePopularity');
    }
  }

  async getPopularContent(mediaType?: 'movie' | 'tv', limit: number = 20): Promise<ContentPopularity[]> {
    try {
      return await this.prisma.contentPopularity.findMany({
        where: mediaType ? { mediaType } : undefined,
        orderBy: {
          viewCount: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      this.handleError(error, 'getPopularContent');
    }
  }
}