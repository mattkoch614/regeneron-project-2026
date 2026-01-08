# Test Suite

## Test Types

### Unit Tests (Fast)
- No database required
- Test validation, business logic, utilities
- Run during development for quick feedback
- **Current coverage**: Health check endpoint only

### Integration Tests (Requires Docker)
- Test with real PostgreSQL database
- Verify end-to-end API behavior with actual data

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Integration Tests
```bash
# 1. Setup (first time only)
cp .env.example .env

# 2. Start test database
docker compose --profile test up -d postgres-test
docker compose --profile test run --rm seed-test

# 3. Run integration tests
npm run test:integration

# Watch mode
npm run test:integration:watch

# 4. Stop test database when done
docker compose --profile test down
```

## Structure

```
tests/
├── health.test.ts            # Unit: Health check endpoint
└── api.integration.test.ts   # Integration: API routes with database
```

- Unit tests: `*.test.ts` (no database connection)
- Integration tests: `*.integration.test.ts` (requires database)

## Writing Tests

### Unit Tests
```typescript
import request from 'supertest';
import app from '../src/app';

describe('Feature', () => {
  let server;

  beforeAll(async () => {
    server = await app();
  });

  it('should do something', async () => {
    const response = await request(server)
      .get('/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('field');
  });
});
```

### Integration Tests
```typescript
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';

describe('Feature - Integration', () => {
  let server;

  beforeAll(async () => {
    server = await app();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should interact with database', async () => {
    const response = await request(server)
      .get('/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```
