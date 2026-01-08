import request from 'supertest';
import { Express } from 'express';
import app from '../src/app';

describe('API Routes', () => {
  let server: Express;

  beforeAll(async () => {
    server = await app();
  });

  describe('GET /api/studies/overview', () => {
    it.skip('should return 200 with study data', async () => {
      // TODO: Requires database connection
      // This test will be implemented once database mocking/setup is in place
      const response = await request(server)
        .get('/api/studies/overview')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('executionTime');
    });
  });

  describe('GET /api/quality', () => {
    it.skip('should return 200 with quality data', async () => {
      // TODO: Requires database connection
      // This test will be implemented once database mocking/setup is in place
      const response = await request(server)
        .get('/api/quality')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(server)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
