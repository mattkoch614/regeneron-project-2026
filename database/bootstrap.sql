-- Clinical Data Database Schema

CREATE TABLE IF NOT EXISTS clinical_data_raw (
    id SERIAL PRIMARY KEY,
    study_id TEXT,
    study_name TEXT,
    study_start_date TEXT,
    study_phase TEXT,
    participant_id TEXT,
    participant_name TEXT,
    participant_dob TEXT,
    participant_gender TEXT,
    participant_enrollment_date TEXT,
    site_id TEXT,
    site_name TEXT,
    site_location TEXT,
    site_coordinator TEXT,
    measurement_type TEXT,
    measurement_value TEXT,
    measurement_unit TEXT,
    measurement_timestamp TEXT,
    quality_score TEXT,
    quality_flags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quality dashboard performance optimization
-- idx_study_id: Optimizes GROUP BY study_id and filtering by study
CREATE INDEX IF NOT EXISTS idx_study_id ON clinical_data_raw(study_id);

-- idx_quality_score_numeric: Optimizes quality score filtering and aggregation
-- Uses functional index on CAST to avoid repeated casting during query execution
CREATE INDEX IF NOT EXISTS idx_quality_score_numeric ON clinical_data_raw((CAST(quality_score AS DECIMAL)));
