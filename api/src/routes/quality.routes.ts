import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Optimized quality distribution endpoint using single aggregated query
// Performance improvements:
// - Single GROUP BY query replaces N+1 pattern (21 queries → 1 query)
// - Database performs aggregation instead of API layer
// - Static query (no user input) - no parameterization needed
// Note: Still performing CAST on quality_score (stored as TEXT) - indexes will further optimize this
router.get('/distribution', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Single aggregated query with GROUP BY
    // Uses conditional aggregation (SUM with CASE) for quality thresholds
    const query = `
      SELECT
        study_id,
        study_name,
        COUNT(*) as total_measurements,
        AVG(CAST(quality_score AS DECIMAL)) as avg_quality_score,
        SUM(CASE WHEN CAST(quality_score AS DECIMAL) >= 0.9 THEN 1 ELSE 0 END) as high_quality_count,
        SUM(CASE WHEN CAST(quality_score AS DECIMAL) < 0.8 THEN 1 ELSE 0 END) as low_quality_count
      FROM clinical_data_raw
      GROUP BY study_id, study_name
      ORDER BY study_id
    `;

    const result = await pool.query(query);

    // Transform database results to match API response format
    const data = result.rows.map(row => ({
      study_id: row.study_id,
      study_name: row.study_name,
      total_measurements: parseInt(row.total_measurements),
      avg_quality_score: parseFloat(row.avg_quality_score),
      high_quality_count: parseInt(row.high_quality_count),
      low_quality_count: parseInt(row.low_quality_count)
    }));

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
