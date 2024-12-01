import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { ScamReport } from '../models/Watchtower';
import jwt from 'jsonwebtoken';

describe('Admin API', () => {
  const API_KEY = process.env.API_KEY;
  let adminToken: string;
  let userToken: string;
  let reportId: string;

  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      walletAddress: '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g1w',
      username: 'admin',
      role: 'admin'
    });

    // Create regular user
    const user = await User.create({
      walletAddress: '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g2w',
      username: 'user',
      role: 'user'
    });

    // Create test report
    const report = await ScamReport.create({
      title: 'Test Scam',
      description: 'Test Description',
      risk_level: 'high',
      scam_type: 'phishing',
      status: 'pending'
    });
    reportId = report.id;

    adminToken = jwt.sign(
      { id: admin.id, walletAddress: admin.walletAddress },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    userToken = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  });

  describe('PUT /api/reports/:id/verify', () => {
    it('should allow admin to verify reports', async () => {
      const response = await request(app)
        .put(`/api/reports/${reportId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('verified');
    });

    it('should not allow regular users to verify reports', async () => {
      const response = await request(app)
        .put(`/api/reports/${reportId}/verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(403);
    });
  });
}); 