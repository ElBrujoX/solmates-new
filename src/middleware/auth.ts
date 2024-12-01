import { Request, Response, NextFunction } from 'express';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    // Add your auth logic here
    // For now, we'll just pass through
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}; 