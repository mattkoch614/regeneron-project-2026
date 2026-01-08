import request from 'supertest';
import { Express } from 'express';
import app from '../src/app';
import { pool } from '../src/db';

describe('API Integration Tests', () => {
  let server: Express;

  beforeAll(async () => {
    server = await app();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/studies/overview', () => {
    it('should return study data', async () => {
      const response = await request(server)
        .get('/api/studies/overview')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('executionTime');
    });
  });

  describe('GET /api/quality/distribution', () => {
    it('should return quality data', async () => {
      const response = await request(server)
        .get('/api/quality/distribution')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('executionTime');
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
