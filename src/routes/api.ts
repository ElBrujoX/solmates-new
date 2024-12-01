import express from 'express';
import { authenticateAPIKey } from '../middleware/auth';
import { reportRoutes } from './reportRoutes';
import { riskRoutes } from './riskRoutes';

const router = express.Router();

// Apply API key validation to all routes
router.use('/', authenticateAPIKey);

// Reports routes
router.use('/reports', reportRoutes);

// Risks routes
router.use('/risks', riskRoutes);

export default router; 