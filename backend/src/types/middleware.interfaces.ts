// Middleware Interfaces for Request/Response Handling

import { Request, Response, NextFunction } from 'express';
import { APIResponse, ErrorType } from './api.types';

// Extended Request interface with additional properties
export interface MiddlewareExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
  user?: any; // For future authentication if needed
  rateLimit?: {
    remaining: number;
    resetTime: Date;
  };
  cache?: {
    key: string;
    ttl: number;
  };
}

// Extended Response interface with helper methods
export interface ExtendedResponse extends Response {
  success<T>(data: T, meta?: any): Response;
  error(type: ErrorType, message: string, code?: string, details?: any): Response;
  cached(data: any, fromCache: boolean): Response;
}

// Middleware Function Type
export type MiddlewareFunction = (
  req: MiddlewareExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
) => void | Promise<void>;

// Error Middleware Function Type
export type ErrorMiddlewareFunction = (
  error: Error,
  req: MiddlewareExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
) => void | Promise<void>;

// Rate Limiting Middleware Interface
export interface IRateLimitMiddleware {
  // Create rate limit middleware
  createRateLimit(options: RateLimitOptions): MiddlewareFunction;
  
  // Check rate limit for specific key
  checkRateLimit(key: string, limit: number, window: number): Promise<RateLimitResult>;
  
  // Reset rate limit for specific key
  resetRateLimit(key: string): Promise<void>;
  
  // Get rate limit status
  getRateLimitStatus(key: string): Promise<RateLimitStatus>;
}

// Rate Limit Options
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  standardHeaders?: boolean; // Send standard rate limit headers
  legacyHeaders?: boolean; // Send legacy rate limit headers
  keyGenerator?: (req: MiddlewareExtendedRequest) => string; // Custom key generator
  skip?: (req: MiddlewareExtendedRequest) => boolean; // Skip rate limiting for certain requests
  onLimitReached?: (req: MiddlewareExtendedRequest, res: ExtendedResponse) => void; // Callback when limit is reached
}

// Rate Limit Result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

// Rate Limit Status
export interface RateLimitStatus {
  remaining: number;
  resetTime: Date;
  totalHits: number;
  limit: number;
}

// Validation Middleware Interface
export interface IValidationMiddleware {
  // Validate request body
  validateBody(schema: any): MiddlewareFunction;
  
  // Validate query parameters
  validateQuery(schema: any): MiddlewareFunction;
  
  // Validate route parameters
  validateParams(schema: any): MiddlewareFunction;
  
  // Custom validation
  validate(validator: (req: MiddlewareExtendedRequest) => ValidationResult): MiddlewareFunction;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Cache Middleware Interface
export interface ICacheMiddleware {
  // Create cache middleware
  createCache(options: CacheOptions): MiddlewareFunction;
  
  // Cache response
  cacheResponse(key: string, data: any, ttl: number): Promise<void>;
  
  // Get cached response
  getCachedResponse(key: string): Promise<any>;
  
  // Invalidate cache
  invalidateCache(pattern: string): Promise<void>;
  
  // Generate cache key
  generateCacheKey(req: MiddlewareExtendedRequest): string;
}

// Cache Options
export interface CacheOptions {
  ttl: number; // Time to live in seconds
  keyGenerator?: (req: MiddlewareExtendedRequest) => string; // Custom key generator
  skip?: (req: MiddlewareExtendedRequest) => boolean; // Skip caching for certain requests
  vary?: string[]; // Vary cache by headers
  compress?: boolean; // Compress cached data
}

// Security Middleware Interface
export interface ISecurityMiddleware {
  // CORS middleware
  cors(options?: CorsOptions): MiddlewareFunction;
  
  // Helmet security headers
  helmet(options?: HelmetOptions): MiddlewareFunction;
  
  // Input sanitization
  sanitize(): MiddlewareFunction;
  
  // XSS protection
  xssProtection(): MiddlewareFunction;
  
  // CSRF protection (if needed in future)
  csrfProtection(): MiddlewareFunction;
}

// CORS Options
export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

// Helmet Options
export interface HelmetOptions {
  contentSecurityPolicy?: boolean | object;
  crossOriginEmbedderPolicy?: boolean | object;
  crossOriginOpenerPolicy?: boolean | object;
  crossOriginResourcePolicy?: boolean | object;
  dnsPrefetchControl?: boolean | object;
  frameguard?: boolean | object;
  hidePoweredBy?: boolean | object;
  hsts?: boolean | object;
  ieNoOpen?: boolean | object;
  noSniff?: boolean | object;
  originAgentCluster?: boolean | object;
  permittedCrossDomainPolicies?: boolean | object;
  referrerPolicy?: boolean | object;
  xssFilter?: boolean | object;
}

// Logging Middleware Interface
export interface ILoggingMiddleware {
  // Request logging
  requestLogger(options?: LoggingOptions): MiddlewareFunction;
  
  // Error logging
  errorLogger(): ErrorMiddlewareFunction;
  
  // Custom logging
  log(level: LogLevel, message: string, meta?: any): void;
}

// Logging Options
export interface LoggingOptions {
  format?: string; // Log format
  skip?: (req: MiddlewareExtendedRequest, res: ExtendedResponse) => boolean; // Skip logging for certain requests
  stream?: any; // Custom stream for logs
}

// Log Level
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Request ID Middleware Interface
export interface IRequestIdMiddleware {
  // Generate and attach request ID
  generateRequestId(): MiddlewareFunction;
  
  // Custom request ID generator
  customRequestId(generator: () => string): MiddlewareFunction;
}

// Response Time Middleware Interface
export interface IResponseTimeMiddleware {
  // Track response time
  trackResponseTime(): MiddlewareFunction;
  
  // Get response time statistics
  getStats(): ResponseTimeStats;
  
  // Reset statistics
  resetStats(): void;
}

// Response Time Statistics
export interface ResponseTimeStats {
  totalRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}