import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const authenticateAPIKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header('X-API-KEY');
  
  if (!apiKey) {
    logger.warn('Missing API key:', { ip: req.ip, path: req.path });
    res.status(401).json({ error: 'API key required' });
    return;
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn('Invalid API key attempt:', {
      ip: req.ip,
      path: req.path
    });
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
}; 