import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Wallet API', () => {
  const API_KEY = process.env.API_KEY;
  let authToken: string;
  const testWalletAddress = '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g1w';

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      walletAddress: testWalletAddress,
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

  describe('GET /api/wallet/:walletAddress/balance', () => {
    it('should get wallet balance', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testWalletAddress}/balance`)
        .set('X-API-KEY', API_KEY as string);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance');
    });
  });
}); 