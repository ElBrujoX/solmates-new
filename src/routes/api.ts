import express from 'express';
import { watchtowerController } from '../controllers/watchtowerController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Scam Reports
router.post('/reports', watchtowerController.createReport);
router.get('/reports', watchtowerController.getReports);
router.get('/reports/:id', watchtowerController.getReportById);
router.put('/reports/:id/verify', watchtowerController.verifyReport);
router.put('/reports/:id/dispute', watchtowerController.disputeReport);

// Risk Indicators
router.get('/risks', watchtowerController.getRiskIndicators);
router.post('/risks', watchtowerController.createRiskIndicator);
router.put('/risks/:id/toggle', watchtowerController.toggleRiskIndicator);

// Live Updates
router.get('/updates', watchtowerController.getLiveUpdates);
router.post('/updates', watchtowerController.createUpdate);

// Verified Scams
router.get('/verified-scams', watchtowerController.getVerifiedScams);

export default router; 