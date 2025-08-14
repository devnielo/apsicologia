import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from '@apsicologia/shared/validations';
import logger from '../config/logger.js';
import { isDevelopment } from '../config/env.js';

// MongoDB error type
interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean = true;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error creators
export const createValidationError = (message: string, details?: any) =>
  new AppError(message, 400, 'VALIDATION_ERROR', details);

export const createNotFoundError = (resource: string = 'Resource') =>
  new AppError(`${resource} not found`, 404, 'NOT_FOUND');

export const createUnauthorizedError = (message: string = 'Unauthorized') =>
  new AppError(message, 401, 'UNAUTHORIZED');

export const createForbiddenError = (message: string = 'Forbidden') =>
  new AppError(message, 403, 'FORBIDDEN');

export const createConflictError = (message: string) =>
  new AppError(message, 409, 'CONFLICT');

export const createTooManyRequestsError = (message: string = 'Too many requests') =>
  new AppError(message, 429, 'TOO_MANY_REQUESTS');

// Error handler middleware
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = createValidationError(message);
  }

  // Mongoose duplicate key
  if ((err as MongoError).code === 11000) {
    const duplicateField = Object.keys((err as any).keyValue)[0];
    const message = `${duplicateField} already exists`;
    error = createConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = createValidationError(message);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = createValidationError(message, err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createUnauthorizedError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = createUnauthorizedError('Token expired');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  const errorResponse: any = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code,
      ...(error.details && { details: error.details }),
    },
  };

  // Include stack trace in development
  if (isDevelopment() && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);
