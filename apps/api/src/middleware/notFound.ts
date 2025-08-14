import { Request, Response, NextFunction } from 'express';
import { createNotFoundError } from './error.js';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createNotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};
