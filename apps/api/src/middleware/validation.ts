import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from '@apsicologia/shared/validations';

/**
 * Create a validation middleware for Zod schemas
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request object (params, query, body)
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors,
        });
      }

      // Handle other validation errors
      return res.status(400).json({
        success: false,
        message: 'Invalid request format',
      });
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Body validation error',
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      });
    }
  };
};

/**
 * Validate only query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Query validation error',
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
      });
    }
  };
};

/**
 * Validate only route parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Parameters validation error',
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid route parameters',
      });
    }
  };
};

export default validateRequest;
