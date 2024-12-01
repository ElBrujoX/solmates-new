import { Request, Response } from 'express';
import { RiskIndicator } from '../models/Watchtower';
import logger from '../utils/logger';

export const riskController = {
  getRisks: async (req: Request, res: Response) => {
    try {
      const risks = await RiskIndicator.find();
      res.json({ data: risks });
    } catch (error) {
      logger.error('Error getting risks:', error);
      res.status(500).json({ error: 'Error getting risks' });
    }
  }
}; 