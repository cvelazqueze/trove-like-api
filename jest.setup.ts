process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-min-16-chars';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://trove:trove@localhost:5432/trove?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
process.env.RUN_SEED = 'false';
