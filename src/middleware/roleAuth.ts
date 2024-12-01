import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
    roles?: string[];
  };
}

export const requireRole = (roles: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.id) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await User.findById(authReq.user.id);
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Role verification failed' });
    }
  };
}; 