import { RequestHandler } from 'express-serve-static-core';
import { check, validationResult } from 'express-validator/check';
import logger from '../utils/logger';

interface ValidationError {
  param: string;
  msg: string;
  location?: string;
  value?: any;
}

// Create validation rules
const titleValidation = check('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 3, max: 100 })
  .withMessage('Title must be between 3 and 100 characters');

const descriptionValidation = check('description')
  .trim()
  .notEmpty()
  .withMessage('Description is required')
  .isLength({ min: 10, max: 1000 })
  .withMessage('Description must be between 10 and 1000 characters');

const riskLevelValidation = check('risk_level')
  .notEmpty()
  .withMessage('Risk level is required')
  .isIn(['low', 'medium', 'high', 'critical'])
  .withMessage('Risk level must be one of: low, medium, high, critical');

const lossAmountValidation = check('loss_amount')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Loss amount must be a positive number');

const victimsCountValidation = check('victims_count')
  .optional()
  .isInt({ min: 0 })
  .withMessage('Victims count must be a positive integer');

const scamTypeValidation = check('scam_type')
  .notEmpty()
  .withMessage('Scam type is required')
  .isString()
  .withMessage('Scam type must be a string');

// Export validation rules array
export const reportValidationRules: RequestHandler[] = [
  titleValidation,
  descriptionValidation,
  riskLevelValidation,
  lossAmountValidation,
  victimsCountValidation,
  scamTypeValidation
];

// Validation middleware
export const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      path: req.path,
      errors: errors.array()
    });
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err: ValidationError) => ({
        field: err.param,
        message: err.msg
      }))
    });
    return;
  }
  next();
}; 