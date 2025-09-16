import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Generate a unique request ID for correlation
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Add request ID to request object for use in other middleware/routes
  (req as any).requestId = requestId;

  // Log request start
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} - Started`);
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    }
    
    return originalJson.call(this, body);
  };

  next();
};