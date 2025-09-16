import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  type?: string;
  details?: any;
}

export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let errorType = err.type || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorType = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    errorType = 'DUPLICATE_ENTRY';
    message = 'Duplicate entry found';
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      type: errorType,
      path: req.originalUrl,
      method: req.method,
    });
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: errorType,
      message,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create custom error
export const createError = (
  message: string,
  statusCode: number = 500,
  type: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.type = type;
  error.details = details;
  return error;
};