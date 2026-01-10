# Database Migrations

This directory contains SQL migration files for database optimizations implemented during the assessment.

## Migration Files

### 001_add_quality_dashboard_indexes.sql
**Task**: Task 1 - Quality Dashboard Optimization
**Impact**: Reduced query execution time from 1.15s to 0.59s (49% improvement)
**Changes**:
- Adds `idx_study_id` index for GROUP BY optimization
- Adds `idx_quality_score_numeric` functional index for quality score aggregations

**Note**: These indexes are already included in `database/bootstrap.sql` for new deployments. This migration file is provided for documentation purposes and for applying to existing databases that were created before the optimization.

## How to Apply Migrations

### For New Deployments
Indexes are already included in `database/bootstrap.sql` and will be applied automatically when you run:
```bash
docker compose up --build
```

### For Existing Databases
If you have an existing database without these indexes, you can apply this migration manually:

```bash
# Option 1: Using psql directly
psql -h localhost -U postgres -d clinical_data -f database/migrations/001_add_quality_dashboard_indexes.sql

# Option 2: Using Docker
docker compose exec db psql -U postgres -d clinical_data -f /docker-entrypoint-initdb.d/migrations/001_add_quality_dashboard_indexes.sql
```

## Verifying Indexes

To verify the indexes were created successfully:

```sql
-- Check if indexes exist
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename = 'clinical_data_raw';

-- Expected output should include:
-- idx_study_id
-- idx_quality_score_numeric
```

## Performance Testing

After applying migrations, test performance:

```bash
# Run performance test
for i in {1..3}; do
  curl -s http://localhost:3000/api/quality/distribution | grep -o '"executionTime":"[^"]*"'
done

# Expected: 0.57-0.66s (avg 0.59s)
# Before migrations: 1.13-1.17s (avg 1.15s)
```
