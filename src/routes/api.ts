import express from 'express';
import { watchtowerController } from '../controllers/watchtowerController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { authController } from '../controllers/authController';
import { requireRole } from '../middleware/roleAuth';
import { walletController } from '../controllers/walletController';

const router = express.Router();

// Auth routes
router.post('/auth/nonce', authController.getNonce);
router.post('/auth/verify', authController.verifyWallet);

// Analytics routes
router.get('/analytics/trending', authenticateAPIKey, watchtowerController.getTrendingScams);
router.get('/analytics/related', authenticateAPIKey, watchtowerController.getRelatedScams);
router.get('/analytics/stats', authenticateAPIKey, watchtowerController.getStats);
router.get('/analytics/risk-stats', authenticateAPIKey, watchtowerController.getRiskStats);

// Reports routes
router.get('/reports', authenticateAPIKey, watchtowerController.getReports);
router.post('/reports', authenticateJWT, watchtowerController.createReport);
router.get('/reports/:id', authenticateAPIKey, watchtowerController.getReportById);
router.put('/reports/:id/verify', authenticateJWT, requireRole(['admin', 'moderator']), watchtowerController.verifyReport);
router.put('/reports/:id/dispute', authenticateJWT, requireRole(['admin', 'moderator']), watchtowerController.disputeReport);

// Risk Indicators routes
router.get('/risks', authenticateAPIKey, watchtowerController.getRiskIndicators);
router.post('/risks', authenticateJWT, requireRole(['admin']), watchtowerController.createRiskIndicator);
router.put('/risks/:id/toggle', authenticateJWT, watchtowerController.toggleRiskIndicator);

// Updates routes
router.get('/updates', authenticateAPIKey, watchtowerController.getLiveUpdates);
router.post('/updates', authenticateJWT, watchtowerController.createUpdate);

// Verified Scams routes
router.get('/verified-scams', authenticateAPIKey, watchtowerController.getVerifiedScams);

// Wallet routes
router.get('/wallet/:walletAddress/balance', authenticateAPIKey, walletController.getBalance);
router.get('/wallet/:walletAddress/tokens', authenticateAPIKey, walletController.getTokens);
router.get('/wallet/:walletAddress/transactions', authenticateAPIKey, walletController.getTransactionHistory);
router.get('/wallet/:walletAddress/spl-tokens', authenticateAPIKey, walletController.getSPLTokens);
router.get('/wallet/:walletAddress/nfts', authenticateAPIKey, walletController.getNFTs);

export default router; 