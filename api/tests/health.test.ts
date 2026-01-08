import request from 'supertest';
import { Express } from 'express';
import app from '../src/app';

describe('Health Check', () => {
  let server: Express;

  beforeAll(async () => {
    server = await app();
  });

  it('should return healthy status', async () => {
    const response = await request(server)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
});
