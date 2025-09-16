import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://starlight:starlight_dev_password@localhost:5432/starlight',
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // TMDB API Configuration
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/',
  },

  // Cache Configuration
  cache: {
    ttl: {
      trending: 3600,      // 1 hour
      popular: 7200,       // 2 hours
      contentDetails: 86400, // 24 hours
      searchResults: 1800,   // 30 minutes
      streamSources: 300,    // 5 minutes
      genres: 604800,        // 1 week
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },

  // Security Configuration
  security: {
    corsOrigins: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || ''] 
      : ['http://localhost:3000', 'http://localhost:5173'],
  },
} as const;

// Validate required environment variables
export const validateConfig = (): void => {
  const requiredVars = ['TMDB_API_KEY'];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  console.log('✅ Configuration validated successfully');
};