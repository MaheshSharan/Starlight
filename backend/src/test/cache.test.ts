import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cacheService } from '../services/cache.service.js';
import { redisService } from '../config/redis.js';

describe('Cache Service', () => {
    beforeAll(async () => {
        // Connect to Redis for testing
        await redisService.connect();
    });

    afterAll(async () => {
        // Clean up and disconnect
        await cacheService.clear('test');
        await redisService.disconnect();
    });

    it('should set and get a value from cache', async () => {
        const key = 'test-key';
        const value = { message: 'Hello, Cache!' };

        // Set value
        const setResult = await cacheService.set(key, value, { prefix: 'test', ttl: 60 });
        expect(setResult).toBe(true);

        // Get value
        const cachedValue = await cacheService.get(key, { prefix: 'test' });
        expect(cachedValue).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
        const result = await cacheService.get('non-existent-key', { prefix: 'test' });
        expect(result).toBeNull();
    });

    it('should delete a key from cache', async () => {
        const key = 'delete-test-key';
        const value = { data: 'to be deleted' };

        // Set value
        await cacheService.set(key, value, { prefix: 'test' });

        // Verify it exists
        const cachedValue = await cacheService.get(key, { prefix: 'test' });
        expect(cachedValue).toEqual(value);

        // Delete it
        const deleteResult = await cacheService.delete(key, { prefix: 'test' });
        expect(deleteResult).toBe(true);

        // Verify it's gone
        const deletedValue = await cacheService.get(key, { prefix: 'test' });
        expect(deletedValue).toBeNull();
    });

    it('should check if key exists', async () => {
        const key = 'exists-test-key';
        const value = { exists: true };

        // Key should not exist initially
        const existsBefore = await cacheService.exists(key, { prefix: 'test' });
        expect(existsBefore).toBe(false);

        // Set value
        await cacheService.set(key, value, { prefix: 'test' });

        // Key should exist now
        const existsAfter = await cacheService.exists(key, { prefix: 'test' });
        expect(existsAfter).toBe(true);
    });
});