import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Deliberately unoptimized quality distribution endpoint
// This query is slow due to:
// - Multiple separate SQL queries instead of one efficient query
// - Full table scan on each query (no indexes)
// - Text to decimal casting on every row
// - Data joining happening at API layer instead of database
// - N+1 query pattern (one query per study)
router.get('/distribution', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // First query: Get all unique studies (full table scan)
    const studiesQuery = `
      SELECT DISTINCT study_id, study_name
      FROM clinical_data_raw
      ORDER BY study_id
    `;
    const studiesResult = await pool.query(studiesQuery);

    // For each study, make separate queries (N+1 pattern)
    const data = [];
    for (const study of studiesResult.rows) {
      // Query 1: Total measurements for this study
      const totalQuery = `
        SELECT COUNT(*) as total_measurements
        FROM clinical_data_raw
        WHERE study_id = '${study.study_id}'
      `;
      const totalResult = await pool.query(totalQuery);

      // Query 2: Average quality score for this study
      const avgQuery = `
        SELECT AVG(CAST(quality_score AS DECIMAL)) as avg_quality_score
        FROM clinical_data_raw
        WHERE study_id = '${study.study_id}'
      `;
      const avgResult = await pool.query(avgQuery);

      // Query 3: High quality count for this study
      const highQualityQuery = `
        SELECT COUNT(*) as high_quality_count
        FROM clinical_data_raw
        WHERE study_id = '${study.study_id}'
        AND CAST(quality_score AS DECIMAL) >= 0.9
      `;
      const highQualityResult = await pool.query(highQualityQuery);

      // Query 4: Low quality count for this study
      const lowQualityQuery = `
        SELECT COUNT(*) as low_quality_count
        FROM clinical_data_raw
        WHERE study_id = '${study.study_id}'
        AND CAST(quality_score AS DECIMAL) < 0.8
      `;
      const lowQualityResult = await pool.query(lowQualityQuery);

      // Join data at API layer
      data.push({
        study_id: study.study_id,
        study_name: study.study_name,
        total_measurements: parseInt(totalResult.rows[0].total_measurements),
        avg_quality_score: parseFloat(avgResult.rows[0].avg_quality_score),
        high_quality_count: parseInt(highQualityResult.rows[0].high_quality_count),
        low_quality_count: parseInt(lowQualityResult.rows[0].low_quality_count)
      });
    }

    const executionTime = Date.now() - startTime;

    res.json({
      data,
      executionTime: `${executionTime}ms`,
      executionTimeSeconds: (executionTime / 1000).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching quality distribution:', error);
    res.status(500).json({
      error: 'Failed to fetch quality distribution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
