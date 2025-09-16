/**
 * Client-side caching utilities for browser storage
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  /**
   * Set an item in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      this.storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache item:', error);
    }
  }

  /**
   * Get an item from cache
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = this.storage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = Date.now();

      // Check if item has expired
      if (now - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to get cache item:', error);
      return null;
    }
  }

  /**
   * Remove an item from cache
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cache item:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();

      keys.forEach(key => {
        try {
          const itemStr = this.storage.getItem(key);
          if (itemStr) {
            const item: CacheItem<any> = JSON.parse(itemStr);
            if (now - item.timestamp > item.ttl) {
              this.remove(key);
            }
          }
        } catch (error) {
          // If we can't parse the item, remove it
          this.remove(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache items:', error);
    }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(this.storage);
      
      keys.forEach(key => {
        const item = this.storage.getItem(key);
        if (item) {
          size += key.length + item.length;
        }
      });

      return size;
    } catch (error) {
      console.warn('Failed to calculate cache size:', error);
      return 0;
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__cache_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create cache instances
export const localCache = new CacheManager(localStorage);
export const sessionCache = new CacheManager(sessionStorage);

// Cache key generators
export const cacheKeys = {
  content: {
    trending: (type: 'movie' | 'tv', page: number) => `trending_${type}_${page}`,
    popular: (type: 'movie' | 'tv', page: number) => `popular_${type}_${page}`,
    details: (type: 'movie' | 'tv', id: number) => `details_${type}_${id}`,
    genres: (type: 'movie' | 'tv') => `genres_${type}`,
  },
  search: {
    results: (query: string, filters: string, page: number) => `search_${query}_${filters}_${page}`,
    suggestions: (query: string) => `suggestions_${query}`,
  },
  user: {
    preferences: 'user_preferences',
    history: 'user_history',
  },
};

// Auto-cleanup expired items on page load
if (typeof window !== 'undefined') {
  // Clean up expired items when the page loads
  localCache.clearExpired();
  sessionCache.clearExpired();

  // Set up periodic cleanup (every 5 minutes)
  setInterval(() => {
    localCache.clearExpired();
    sessionCache.clearExpired();
  }, 5 * 60 * 1000);
}