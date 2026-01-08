# Test Suite

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Structure

- `tests/` - Test files using Jest and Supertest
- Tests follow the pattern `*.test.ts`

## Writing Tests

Tests use:
- **Jest** - Test runner and assertions
- **Supertest** - HTTP assertions for Express

Example:
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

## Performance Baseline

Use this suite to establish and measure performance baselines:
- Response times
- Query execution times
- Payload sizes
- Database query counts
