import express from 'express';
import { watchtowerController } from '../controllers/watchtowerController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { authController } from '../controllers/authController';
import { requireRole } from '../middleware/roleAuth';
import { walletController } from '../controllers/walletController';
import { reportValidationRules, validate } from '../middleware/validation';
import { Request, Response } from 'express';
import { ScamReport, RiskIndicator } from '../models/Watchtower';

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
router.post('/reports', [
  authenticateJWT,
  ...reportValidationRules,
  validate,
  watchtowerController.createReport
]);
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

// Monitoring routes
router.get('/monitor/health', authenticateAPIKey, (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.get('/monitor/rate-limits', authenticateAPIKey, (req: Request, res: Response) => {
  const now = Date.now();
  const resetTime = (req.rateLimit?.resetTime || now) as number;
  
  const limits = {
    reports: {
      limit: 50,
      remaining: req.rateLimit?.remaining || 0,
      resetIn: Math.max(0, (resetTime - now) / 1000),
      resetAt: new Date(resetTime).toISOString()
    },
    global: {
      limit: 200,
      remaining: req.rateLimit?.remaining || 0,
      resetIn: Math.max(0, (resetTime - now) / 1000),
      resetAt: new Date(resetTime).toISOString()
    }
  };

  res.json({
    status: 'ok',
    limits,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
});

router.get('/monitor/stats', authenticateAPIKey, async (req: Request, res: Response) => {
  try {
    const stats = {
      reports: await ScamReport.countDocuments(),
      verified: await ScamReport.countDocuments({ status: 'verified' }),
      disputed: await ScamReport.countDocuments({ status: 'disputed' }),
      risks: await RiskIndicator.countDocuments(),
      activeRisks: await RiskIndicator.countDocuments({ is_active: true })
    };
    res.json({
      status: 'ok',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router; 