-- Migration: Add indexes for quality dashboard performance optimization
-- Task: Task 1 - Quality Dashboard Optimization
-- Description: Adds two indexes to improve query performance from 1.15s to 0.59s

-- idx_study_id: Optimizes GROUP BY study_id and filtering by study
-- Impact: Eliminates full table scans when grouping by study
CREATE INDEX IF NOT EXISTS idx_study_id ON clinical_data_raw(study_id);

-- idx_quality_score_numeric: Optimizes quality score filtering and aggregation
-- Uses functional index on CAST to avoid repeated casting during query execution
-- Impact: Improves performance of MIN/MAX/AVG operations on quality_score
CREATE INDEX IF NOT EXISTS idx_quality_score_numeric ON clinical_data_raw((CAST(quality_score AS DECIMAL)));
