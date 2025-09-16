import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

// Create Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  // Add missing configuration options
  errorFormat: 'pretty',
  // Disable tracing for now to avoid the error
});

// Database connection utility
export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    const maxRetries = 10;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$connect();
        this.isConnected = true;
        console.log('✅ Database connected successfully');
        return;
      } catch (error) {
        console.log(`🔄 Database connection attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelay}ms...`);
        
        if (attempt === maxRetries) {
          console.error('❌ Database connection failed after all retries:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public getClient(): PrismaClient {
    return prisma;
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down database connection...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down database connection...');
  await databaseService.disconnect();
  process.exit(0);
});