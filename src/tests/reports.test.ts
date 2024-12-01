import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Reports API', () => {
  const API_KEY = process.env.API_KEY;
  let authToken: string;

  beforeEach(async () => {
    // Create test user with required fields
    const user = await User.create({
      walletAddress: '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g1w',
      username: 'testuser',
      role: 'admin'
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/reports', () => {
    it('should create a new report', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-API-KEY', API_KEY as string)
        .send({
          title: 'Test Report',
          description: 'Testing the API',
          risk_level: 'high',
          scam_type: 'phishing',
          loss_amount: 1000,
          victims_count: 5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', 'Test Report');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-API-KEY', API_KEY as string)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('X-API-KEY', API_KEY as string)
        .send({
          title: 'Test Report',
          description: 'Testing the API',
          risk_level: 'high'
        });

      expect(response.status).toBe(401);
    });
  });

  // Add more test cases...
}); 