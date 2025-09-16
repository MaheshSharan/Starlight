import { createClient, RedisClientType } from 'redis';
import { config } from './index.js';

export class RedisService {
    private static instance: RedisService;
    private client: RedisClientType;
    private isConnected = false;

    private constructor() {
        this.client = createClient({
            url: config.redis.url,
            socket: {
                host: config.redis.host,
                port: config.redis.port,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Redis: Too many reconnection attempts, giving up');
                        return new Error('Too many reconnection attempts');
                    }
                    const delay = Math.min(retries * 50, 2000);
                    console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
                    return delay;
                },
            },
            password: config.redis.password,
        });

        // Event listeners
        this.client.on('connect', () => {
            console.log('🔄 Redis: Connecting...');
        });

        this.client.on('ready', () => {
            console.log('✅ Redis: Connected and ready');
            this.isConnected = true;
        });

        this.client.on('error', (error) => {
            console.error('❌ Redis error:', error);
            this.isConnected = false;
        });

        this.client.on('end', () => {
            console.log('🔌 Redis: Connection ended');
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            console.log('🔄 Redis: Reconnecting...');
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async connect(): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.client.connect();
            }
        } catch (error) {
            console.error('❌ Redis connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.isConnected) {
                await this.client.disconnect();
                this.isConnected = false;
                console.log('✅ Redis disconnected successfully');
            }
        } catch (error) {
            console.error('❌ Redis disconnection failed:', error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('❌ Redis health check failed:', error);
            return false;
        }
    }

    public isHealthy(): boolean {
        return this.isConnected;
    }

    public getClient(): RedisClientType {
        return this.client;
    }
}

// Export singleton instance
export const redisService = RedisService.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('🔄 Gracefully shutting down Redis connection...');
    await redisService.disconnect();
});

process.on('SIGTERM', async () => {
    console.log('🔄 Gracefully shutting down Redis connection...');
    await redisService.disconnect();
});