import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Optimized study overview endpoint using single aggregated query
// Performance improvements:
// - Single GROUP BY query replaces N+1 pattern (16 queries → 1 query)
// - Database performs aggregation instead of API layer
// - Uses COUNT(DISTINCT ...) for participant and site counts
router.get('/overview', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Single aggregated query with GROUP BY
    // Uses COUNT(DISTINCT ...) for unique counts of participants and sites
    const query = `
      SELECT
        study_id,
        study_name,
        study_phase,
        COUNT(DISTINCT participant_id) as participant_count,
        COUNT(*) as total_measurements,
        COUNT(DISTINCT site_id) as site_count
      FROM clinical_data_raw
      GROUP BY study_id, study_name, study_phase
      ORDER BY study_id
    `;

    const result = await pool.query(query);

    // Transform database results to match API response format
    const data = result.rows.map(row => ({
      study_id: row.study_id,
      study_name: row.study_name,
      study_phase: row.study_phase,
      participant_count: parseInt(row.participant_count),
      total_measurements: parseInt(row.total_measurements),
      site_count: parseInt(row.site_count)
    }));

    const executionTime = Date.now() - startTime;

    res.json({
      data,
      executionTime: `${executionTime}ms`,
      executionTimeSeconds: (executionTime / 1000).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching study overview:', error);
    res.status(500).json({
      error: 'Failed to fetch study overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
