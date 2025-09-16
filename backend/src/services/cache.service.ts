import { RedisClientType } from 'redis';
import { redisService } from '@/config/redis.js';
import { ICacheService } from '@/types/service.interfaces.js';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class CacheService implements ICacheService {
  private client: RedisClientType;
  private defaultTTL = 3600; // 1 hour default

  constructor() {
    this.client = redisService.getClient();
  }

  /**
   * Generate cache key with optional prefix
   */
  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'starlight';
    return `${keyPrefix}:${key}`;
  }

  /**
   * Get value from cache (ICacheService interface)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, cache miss for key:', key);
        return null;
      }

      const cacheKey = this.generateKey(key);
      const value = await this.client.get(cacheKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null; // Graceful degradation
    }
  }

  /**
   * Get value from cache with options (legacy method)
   */
  async getWithOptions<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, cache miss for key:', key);
        return null;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      const value = await this.client.get(cacheKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null; // Graceful degradation
    }
  }

  /**
   * Set value in cache (ICacheService interface)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache set for key:', key);
        return;
      }

      const cacheKey = this.generateKey(key);
      const cacheTTL = ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);

      await this.client.setEx(cacheKey, cacheTTL, serializedValue);
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }

  /**
   * Set value in cache with options (legacy method)
   */
  async setWithOptions<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache set for key:', key);
        return false;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);

      await this.client.setEx(cacheKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error);
      return false; // Graceful degradation
    }
  }

  /**
   * Delete specific key from cache (ICacheService interface)
   */
  async del(key: string): Promise<void> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache delete for key:', key);
        return;
      }

      const cacheKey = this.generateKey(key);
      await this.client.del(cacheKey);
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }

  /**
   * Delete specific key from cache with options (legacy method)
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache delete for key:', key);
        return false;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.del(cacheKey);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache keys by pattern (ICacheService interface)
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache invalidation for pattern:', pattern);
        return;
      }

      const searchPattern = this.generateKey(pattern);
      const keys = await this.client.keys(searchPattern);
      
      if (keys.length === 0) {
        return;
      }

      await this.client.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys matching pattern: ${searchPattern}`);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }

  /**
   * Get keys matching pattern (ICacheService interface)
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      if (!redisService.isHealthy()) {
        return [];
      }

      const searchPattern = this.generateKey(pattern);
      return await this.client.keys(searchPattern);
    } catch (error) {
      console.error('❌ Cache keys error:', error);
      return [];
    }
  }

  /**
   * Invalidate cache keys by pattern with options (legacy method)
   */
  async invalidateWithOptions(pattern: string, options: CacheOptions = {}): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        console.warn('⚠️ Redis not available, skipping cache invalidation for pattern:', pattern);
        return 0;
      }

      const searchPattern = this.generateKey(pattern, options.prefix);
      const keys = await this.client.keys(searchPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      console.log(`🗑️ Invalidated ${result} cache keys matching pattern: ${searchPattern}`);
      return result;
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache (ICacheService interface)
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        return false;
      }

      const cacheKey = this.generateKey(key);
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('❌ Cache exists check error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key (ICacheService interface)
   */
  async ttl(key: string): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return -1;
      }

      const cacheKey = this.generateKey(key);
      return await this.client.ttl(cacheKey);
    } catch (error) {
      console.error('❌ Cache TTL check error:', error);
      return -1;
    }
  }

  /**
   * Set expiration for existing key (ICacheService interface)
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        return false;
      }

      const cacheKey = this.generateKey(key);
      return await this.client.expire(cacheKey, seconds);
    } catch (error) {
      console.error('❌ Cache expire error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key with options (legacy method)
   */
  async getTTL(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return -1;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      return await this.client.ttl(cacheKey);
    } catch (error) {
      console.error('❌ Cache TTL check error:', error);
      return -1;
    }
  }

  /**
   * Extend TTL for existing key (legacy method)
   */
  async extend(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        return false;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.expire(cacheKey, ttl);
      return result;
    } catch (error) {
      console.error('❌ Cache extend error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(prefix?: string): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        return false;
      }

      const pattern = prefix ? `${prefix}:*` : 'starlight:*';
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return true;
      }

      await this.client.del(keys);
      console.log(`🗑️ Cleared ${keys.length} cache keys with pattern: ${pattern}`);
      return true;
    } catch (error) {
      console.error('❌ Cache clear error:', error);
      return false;
    }
  }

  // Hash operations for complex data (ICacheService interface)
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      if (!redisService.isHealthy()) {
        return null;
      }

      const cacheKey = this.generateKey(key);
      const value = await this.client.hGet(cacheKey, field);
      
      if (value === null || value === undefined) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache hget error:', error);
      return null;
    }
  }

  async hset<T>(key: string, field: string, value: T): Promise<void> {
    try {
      if (!redisService.isHealthy()) {
        return;
      }

      const cacheKey = this.generateKey(key);
      const serializedValue = JSON.stringify(value);
      await this.client.hSet(cacheKey, field, serializedValue);
    } catch (error) {
      console.error('❌ Cache hset error:', error);
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      if (!redisService.isHealthy()) {
        return;
      }

      const cacheKey = this.generateKey(key);
      await this.client.hDel(cacheKey, field);
    } catch (error) {
      console.error('❌ Cache hdel error:', error);
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      if (!redisService.isHealthy()) {
        return {};
      }

      const cacheKey = this.generateKey(key);
      const values = await this.client.hGetAll(cacheKey);
      
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(values)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          // Skip invalid JSON values
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cache hgetall error:', error);
      return {};
    }
  }

  // List operations (ICacheService interface)
  async lpush<T>(key: string, ...values: T[]): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return 0;
      }

      const cacheKey = this.generateKey(key);
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.lPush(cacheKey, serializedValues);
    } catch (error) {
      console.error('❌ Cache lpush error:', error);
      return 0;
    }
  }

  async rpush<T>(key: string, ...values: T[]): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return 0;
      }

      const cacheKey = this.generateKey(key);
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.rPush(cacheKey, serializedValues);
    } catch (error) {
      console.error('❌ Cache rpush error:', error);
      return 0;
    }
  }

  async lpop<T>(key: string): Promise<T | null> {
    try {
      if (!redisService.isHealthy()) {
        return null;
      }

      const cacheKey = this.generateKey(key);
      const value = await this.client.lPop(cacheKey);
      
      if (value === null || value === undefined) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache lpop error:', error);
      return null;
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    try {
      if (!redisService.isHealthy()) {
        return null;
      }

      const cacheKey = this.generateKey(key);
      const value = await this.client.rPop(cacheKey);
      
      if (value === null || value === undefined) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache rpop error:', error);
      return null;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      if (!redisService.isHealthy()) {
        return [];
      }

      const cacheKey = this.generateKey(key);
      const values = await this.client.lRange(cacheKey, start, stop);
      
      return values.map(value => {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T; // Return as-is if not JSON
        }
      });
    } catch (error) {
      console.error('❌ Cache lrange error:', error);
      return [];
    }
  }

  // Set operations (ICacheService interface)
  async sadd<T>(key: string, ...members: T[]): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return 0;
      }

      const cacheKey = this.generateKey(key);
      const serializedMembers = members.map(m => JSON.stringify(m));
      return await this.client.sAdd(cacheKey, serializedMembers);
    } catch (error) {
      console.error('❌ Cache sadd error:', error);
      return 0;
    }
  }

  async srem<T>(key: string, ...members: T[]): Promise<number> {
    try {
      if (!redisService.isHealthy()) {
        return 0;
      }

      const cacheKey = this.generateKey(key);
      const serializedMembers = members.map(m => JSON.stringify(m));
      return await this.client.sRem(cacheKey, serializedMembers);
    } catch (error) {
      console.error('❌ Cache srem error:', error);
      return 0;
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      if (!redisService.isHealthy()) {
        return [];
      }

      const cacheKey = this.generateKey(key);
      const values = await this.client.sMembers(cacheKey);
      
      return values.map(value => {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T; // Return as-is if not JSON
        }
      });
    } catch (error) {
      console.error('❌ Cache smembers error:', error);
      return [];
    }
  }

  async sismember<T>(key: string, member: T): Promise<boolean> {
    try {
      if (!redisService.isHealthy()) {
        return false;
      }

      const cacheKey = this.generateKey(key);
      const serializedMember = JSON.stringify(member);
      return await this.client.sIsMember(cacheKey, serializedMember);
    } catch (error) {
      console.error('❌ Cache sismember error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage?: string;
  }> {
    try {
      if (!redisService.isHealthy()) {
        return {
          connected: false,
          keyCount: 0,
        };
      }

      const keys = await this.client.keys('starlight:*');
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      
      return {
        connected: true,
        keyCount: keys.length,
        memoryUsage: memoryMatch ? memoryMatch[1].trim() : undefined,
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return {
        connected: false,
        keyCount: 0,
      };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();