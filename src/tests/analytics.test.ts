import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { ScamReport } from '../models/Watchtower';
import jwt from 'jsonwebtoken';

describe('Analytics API', () => {
  const API_KEY = process.env.API_KEY;
  let authToken: string;

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      walletAddress: '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g1w',
      username: 'testuser',
      role: 'admin'
    });

    // Create test reports
    await ScamReport.create({
      title: 'Test Scam 1',
      description: 'Test Description',
      risk_level: 'high',
      scam_type: 'phishing',
      status: 'verified'
    });

    authToken = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  });

  describe('GET /api/analytics/trending', () => {
    it('should return trending scams', async () => {
      const response = await request(app)
        .get('/api/analytics/trending')
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toBeInstanceOf(Array);
    });

    it('should respect days parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/trending?days=30')
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.timeframe).toBe('30 days');
    });
  });

  describe('GET /api/analytics/stats', () => {
    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/stats')
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_reports');
      expect(response.body).toHaveProperty('verified_reports');
    });
  });
}); 