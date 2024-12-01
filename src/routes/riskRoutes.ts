import express from 'express';
import { riskController } from '../controllers/riskController';

const router = express.Router();

// Get risks with filters and pagination
router.get('/', riskController.getRisks);

export { router as riskRoutes }; 