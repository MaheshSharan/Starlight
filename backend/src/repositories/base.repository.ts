import { PrismaClient } from '@prisma/client';
import { prisma } from '@/config/database.js';

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  protected handleError(error: any, operation: string): never {
    console.error(`Repository error in ${operation}:`, error);
    
    if (error.code === 'P2002') {
      throw new Error('Duplicate entry found');
    } else if (error.code === 'P2025') {
      throw new Error('Record not found');
    } else if (error.code === 'P2003') {
      throw new Error('Foreign key constraint failed');
    }
    
    throw new Error(`Database operation failed: ${operation}`);
  }
}