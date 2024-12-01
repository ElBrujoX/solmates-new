import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator/check';
import logger from '../utils/logger';

export const validateReport = [
  check('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  
  check('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  check('risk_level')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid risk level'),
  
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed:', errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }
]; 