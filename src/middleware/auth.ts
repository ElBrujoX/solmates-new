import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  walletAddress: string;
  roles?: string[];
}

export const authenticateJWT: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    (req as any).user = {
      id: decoded.id,
      walletAddress: decoded.walletAddress,
      roles: decoded.roles
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAPIKey: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
}; 