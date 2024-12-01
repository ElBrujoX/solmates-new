import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-KEY');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn('Invalid API key attempt:', {
      ip: req.ip,
      path: req.path,
      providedKey: apiKey
    });
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}; 