import request from 'supertest';
import { Express } from 'express';
import app from '../src/app';
import { pool } from '../src/db';

// Mock the database pool
jest.mock('../src/db', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn()
  }
}));

// Mock the cache module - pass through to fetch function
jest.mock('../src/cache', () => ({
  cacheGet: jest.fn(async (_key: string, fetchFn: () => Promise<unknown>) => {
    const data = await fetchFn();
    return { data, cached: false };
  }),
  cacheInvalidate: jest.fn(),
  cacheStats: jest.fn(() => ({ hits: 0, misses: 0 }))
}));

const mockPoolQuery = pool.query as jest.Mock;

describe('API Contract Tests', () => {
  let server: Express;

  beforeAll(async () => {
    server = await app();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/studies/overview', () => {
    it('should return study data with correct shape', async () => {
      // Mock database response
      mockPoolQuery.mockResolvedValueOnce({
        rows: [
          {
            study_id: 'CARDIO001',
            study_name: 'Cardiovascular Health Study',
            study_phase: 'Phase 3',
            participant_count: '1000',
            total_measurements: '100000',
            site_count: '5'
          },
          {
            study_id: 'DIABETES002',
            study_name: 'Diabetes Management Trial',
            study_phase: 'Phase 2',
            participant_count: '800',
            total_measurements: '80000',
            site_count: '4'
          }
        ]
      } as any);

      const response = await request(server)
        .get('/api/studies/overview')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('study_id');
      expect(response.body.data[0]).toHaveProperty('study_name');
      expect(response.body.data[0]).toHaveProperty('participant_count');
      expect(response.body).toHaveProperty('executionTime');
    });
  });

  describe('GET /api/quality/distribution', () => {
    it('should return quality data with correct shape', async () => {
      // Mock database response
      mockPoolQuery.mockResolvedValueOnce({
        rows: [
          {
            study_id: 'CARDIO001',
            study_name: 'Cardiovascular Health Study',
            total_measurements: '100000',
            avg_quality_score: '0.8934',
            high_quality_count: '75000',
            low_quality_count: '5000'
          }
        ]
      } as any);

      const response = await request(server)
        .get('/api/quality/distribution')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('study_id');
      expect(response.body.data[0]).toHaveProperty('avg_quality_score');
      expect(response.body.data[0]).toHaveProperty('high_quality_count');
      expect(response.body.data[0]).toHaveProperty('low_quality_count');
      expect(response.body).toHaveProperty('executionTime');
    });
  });

  describe('GET /api/studies/:studyId', () => {
    it('should return participant summary with correct shape for valid study', async () => {
      // Mock multiple queries executed by the endpoint
      mockPoolQuery
        .mockResolvedValueOnce({
          // Main aggregation query
          rows: [{
            study_id: 'CARDIO001',
            study_name: 'Cardiovascular Health Study',
            study_phase: 'Phase 3',
            total_participants: '1000',
            avg_age: '52.3',
            min_age: '25',
            max_age: '75',
            total_measurements: '100000',
            site_count: '5',
            start_date: '2022-01-15',
            end_date: '2024-12-31'
          }]
        } as any)
        .mockResolvedValueOnce({
          // Gender breakdown query
          rows: [
            { participant_gender: 'Male', count: '520' },
            { participant_gender: 'Female', count: '480' }
          ]
        } as any)
        .mockResolvedValueOnce({
          // Site distribution query
          rows: [
            { site_id: 'SITE_NY01', site_name: 'New York Medical Center', participant_count: '250' },
            { site_id: 'SITE_CA01', site_name: 'California Research Institute', participant_count: '200' }
          ]
        } as any);

      const response = await request(server)
        .get('/api/studies/CARDIO001')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('study_id', 'CARDIO001');
      expect(response.body.data).toHaveProperty('study_name');
      expect(response.body.data).toHaveProperty('total_participants');
      expect(response.body.data).toHaveProperty('age_distribution');
      expect(response.body.data.age_distribution).toHaveProperty('average');
      expect(response.body.data.age_distribution).toHaveProperty('min');
      expect(response.body.data.age_distribution).toHaveProperty('max');
      expect(response.body.data).toHaveProperty('gender_breakdown');
      expect(Array.isArray(response.body.data.gender_breakdown)).toBe(true);
      expect(response.body.data.gender_breakdown[0]).toHaveProperty('gender');
      expect(response.body.data.gender_breakdown[0]).toHaveProperty('count');
      expect(response.body.data.gender_breakdown[0]).toHaveProperty('percentage');
      expect(response.body.data).toHaveProperty('site_distribution');
      expect(Array.isArray(response.body.data.site_distribution)).toBe(true);
      expect(response.body.data.site_distribution[0]).toHaveProperty('site_id');
      expect(response.body.data.site_distribution[0]).toHaveProperty('site_name');
      expect(response.body.data.site_distribution[0]).toHaveProperty('participant_count');
      expect(response.body.data).toHaveProperty('avg_measurements_per_participant');
      expect(response.body.data).toHaveProperty('date_range');
      expect(response.body.data.date_range).toHaveProperty('start_date');
      expect(response.body.data.date_range).toHaveProperty('end_date');
      expect(response.body).toHaveProperty('executionTime');
    });

    it('should return 404 for non-existent study', async () => {
      // Mock empty result for non-existent study
      mockPoolQuery.mockResolvedValueOnce({
        rows: []
      } as any);

      const response = await request(server)
        .get('/api/studies/INVALID999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Study not found');
      expect(response.body).toHaveProperty('message');
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
