import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header' });
    return;
  }

  try {
    // Add your auth logic here
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}; 