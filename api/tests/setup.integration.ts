// Setup file for integration tests
// Ensures TEST_DATABASE_URL is set before tests run

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Copy .env.example to .env and configure it.'
  );
}

// Override DATABASE_URL for integration tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
