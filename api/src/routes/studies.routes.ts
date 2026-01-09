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

// Get individual study participant summary by ID
router.get('/:studyId', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { studyId } = req.params;

  try {
    // Aggregated query for participant summary
    // Calculate age from DOB using EXTRACT(YEAR FROM AGE(...))
    const query = `
      SELECT
        study_id,
        study_name,
        study_phase,
        COUNT(DISTINCT participant_id) as total_participants,
        AVG(EXTRACT(YEAR FROM AGE(CAST(participant_dob AS DATE)))) as avg_age,
        MIN(EXTRACT(YEAR FROM AGE(CAST(participant_dob AS DATE)))) as min_age,
        MAX(EXTRACT(YEAR FROM AGE(CAST(participant_dob AS DATE)))) as max_age,
        COUNT(*) as total_measurements,
        COUNT(DISTINCT site_id) as site_count,
        MIN(CAST(measurement_timestamp AS DATE)) as start_date,
        MAX(CAST(measurement_timestamp AS DATE)) as end_date
      FROM clinical_data_raw
      WHERE study_id = $1
      GROUP BY study_id, study_name, study_phase
    `;

    const result = await pool.query(query, [studyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Study not found',
        message: `No study found with ID: ${studyId}`
      });
    }

    // Get gender breakdown
    const genderQuery = `
      SELECT 
        participant_gender,
        COUNT(DISTINCT participant_id) as count
      FROM clinical_data_raw
      WHERE study_id = $1
      GROUP BY participant_gender
      ORDER BY participant_gender
    `;

    const genderResult = await pool.query(genderQuery, [studyId]);

    // Get site distribution
    const siteQuery = `
      SELECT 
        site_id,
        COUNT(DISTINCT participant_id) as participant_count
      FROM clinical_data_raw
      WHERE study_id = $1
      GROUP BY site_id
      ORDER BY site_id
    `;

    const siteResult = await pool.query(siteQuery, [studyId]);

    const row = result.rows[0];
    const totalParticipants = parseInt(row.total_participants);
    const totalMeasurements = parseInt(row.total_measurements);

    const executionTime = Date.now() - startTime;

    res.json({
      data: {
        study_id: row.study_id,
        study_name: row.study_name,
        study_phase: row.study_phase,
        total_participants: totalParticipants,
        age_distribution: {
          average: parseFloat(row.avg_age).toFixed(1),
          min: parseInt(row.min_age),
          max: parseInt(row.max_age)
        },
        gender_breakdown: genderResult.rows.map(g => ({
          gender: g.participant_gender,
          count: parseInt(g.count),
          percentage: ((parseInt(g.count) / totalParticipants) * 100).toFixed(1)
        })),
        site_distribution: siteResult.rows.map(s => ({
          site_id: s.site_id,
          participant_count: parseInt(s.participant_count)
        })),
        total_measurements: totalMeasurements,
        avg_measurements_per_participant: (totalMeasurements / totalParticipants).toFixed(1),
        date_range: {
          start_date: row.start_date,
          end_date: row.end_date
        }
      },
      executionTime: `${executionTime}ms`,
      executionTimeSeconds: (executionTime / 1000).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching study details:', error);
    res.status(500).json({
      error: 'Failed to fetch study details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
