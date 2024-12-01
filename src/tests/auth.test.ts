import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  const API_KEY = process.env.API_KEY;

  it('should get nonce for wallet', async () => {
    const response = await request(app)
      .post('/api/auth/nonce')
      .set('X-API-KEY', API_KEY as string)
      .send({
        walletAddress: '95quQpCv4xxCowdwjdt8GLThivwZzzZZECMGo8QG9g1w'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nonce');
  });
}); 