# Performance Metrics

## Task 1: Quality Dashboard Optimization

### Baseline (Before Optimization)
**Date**: 2026-01-08
**Branch**: test-suite
**Database**: 1,000,000 rows (200k measurements × 5 studies)

**Measurements**:
- **Execution time**: ~1.15s average
  - Test 1: 1.17s (1171ms)
  - Test 2: 1.16s (1156ms)
  - Test 3: 1.13s (1133ms)
- **Database queries**: 21 (N+1 pattern: 1 initial + 4 queries × 5 studies)
- **Response size**: ~800 bytes
- **Query pattern**: Separate queries for each study's total count, avg score, high quality count, low quality count

**Test Command**:
```bash
time curl -s http://localhost:3000/api/quality/distribution
```

**Issues Identified**:
1. N+1 query pattern (21 separate queries)
2. No database indexes on `study_id` or `quality_score`
3. Full table scans on every query
4. Type casting `quality_score` from TEXT to DECIMAL on every row
5. Data aggregation happening at API layer instead of database

---

### Step 2: Single Aggregated Query
**Goal**: Replace 21 queries with 1 aggregated GROUP BY query

**Implementation**:
- Single SQL query using GROUP BY with aggregate functions
- Database performs aggregation instead of API layer
- Fixed SQL injection vulnerability (was using string interpolation)

**Results**:
- **Execution time**: ~1.22s average
  - Test 1: 1.31s (1311ms)
  - Test 2: 1.18s (1176ms)
  - Test 3: 1.17s (1166ms)
- **Database queries**: 1 (reduced from 21)
- **Improvement vs baseline**: ~6% slower (-0.07s)

**Analysis**:
No significant performance improvement at this stage because we're still doing a full table scan on 1M rows. The single query must scan the entire table to compute aggregates across all studies. Without indexes, PostgreSQL cannot optimize the GROUP BY operation. Expected improvement will come from adding indexes in Step 3.

---

### Step 3: Database Indexes
**Goal**: Add indexes to eliminate full table scans

**Implementation**:
- Added index on `study_id` (optimizes GROUP BY operation)
- Added functional index on `CAST(quality_score AS DECIMAL)` (optimizes quality filtering)
- Recreated database with new schema

**Results**:
- **Execution time**: ~0.60s average
  - Test 1: 0.61s (609ms)
  - Test 2: 0.59s (594ms)
  - Test 3: 0.58s (584ms)
- **Improvement vs baseline**: 48% faster (1.15s → 0.60s, saved 0.55s)
- **Improvement vs Step 2**: 51% faster (1.22s → 0.60s, saved 0.62s)

**Analysis**:
The indexes provide significant performance improvement by eliminating full table scans. PostgreSQL can now:
1. Use `idx_study_id` to efficiently GROUP BY study_id
2. Use `idx_quality_score_numeric` to avoid repeated CAST operations during aggregation
3. Process the query in ~half the time compared to baseline

---

### Step 4: Frontend UX Improvements
**Goal**: Fix bugs and improve data readability

**Changes**:
- Fixed `fetchCount` dependency bug (prevented extra fetches)
- Added number formatting with commas
- Improved decimal precision display

**Impact**: UX improvements, no performance impact on API

---

### Final Results
**Total Performance Improvement**: [TBD - to be calculated after Step 3]

**Summary**:
- Baseline: ~1.15s, 21 queries
- Final: [TBD]s, 1 query with indexes
- Improvement: [TBD]%

---

## Methodology

**Test Environment**:
- Docker Compose with PostgreSQL 15
- Node.js API running in container
- Database seeded with 1M rows using `seed-data.js`

**Measurement Approach**:
1. Execute API endpoint 3 times to get average response time
2. Use server-side timing (`executionTime` in API response) for accuracy
3. Compare before/after for each optimization step
4. Document cumulative improvement

**Reproducibility**:
```bash
# Start environment
make start

# Wait for services to be ready
sleep 10

# Run performance test
for i in {1..3}; do
  curl -s http://localhost:3000/api/quality/distribution | grep -o '"executionTime":"[^"]*"'
done
```
