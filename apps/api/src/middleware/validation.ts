import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validation middleware to handle express-validator results
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
    });
  }
  
  next();
};

export default validateRequest;
