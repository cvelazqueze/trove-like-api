import { z } from 'zod';

const boolFromEnv = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');

const seedProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional(),
});

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    APP_HOST: z.string().default('localhost'),
    API_PREFIX: z.string().default('/api'),

    DATABASE_URL: z.string().optional(),
    POSTGRES_HOST: z.string().default('localhost'),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_USER: z.string().default('trove'),
    POSTGRES_PASSWORD: z.string().default('trove'),
    POSTGRES_DB: z.string().default('trove'),
    POSTGRES_SCHEMA: z.string().default('public'),

    REDIS_URL: z.string().optional(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),

    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().min(4).max(15).default(10),

    CACHE_TRENDING_TTL_SECONDS: z.coerce.number().positive().default(300),
    CACHE_TRENDING_KEY_PREFIX: z.string().default('products:trending'),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().positive().default(100),

    RUN_SEED: boolFromEnv.default(false),
    SEED_USER_EMAIL: z.string().email().optional(),
    SEED_USER_PASSWORD: z.string().min(8).optional(),
    SEED_USER_NAME: z.string().min(1).optional(),
    SEED_COLLECTION_NAME: z.string().min(1).optional(),
    SEED_PRODUCTS_JSON: z.string().optional(),

    SOCKET_CORS_ORIGIN: z.string().default('*'),
    SOCKET_PATH: z.string().default('/socket.io'),
    SOCKET_ROOM_PREFIX: z.string().default('collection:'),

    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
  })
  .superRefine((env, ctx) => {
    if (!env.RUN_SEED) return;

    const required: Array<keyof typeof env> = [
      'SEED_USER_EMAIL',
      'SEED_USER_PASSWORD',
      'SEED_USER_NAME',
      'SEED_COLLECTION_NAME',
      'SEED_PRODUCTS_JSON',
    ];

    for (const key of required) {
      if (!env[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required when RUN_SEED=true`,
          path: [key],
        });
      }
    }

    if (env.SEED_PRODUCTS_JSON) {
      try {
        const parsed = JSON.parse(env.SEED_PRODUCTS_JSON);
        const result = z.array(seedProductSchema).min(1).safeParse(parsed);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SEED_PRODUCTS_JSON must be a JSON array of { name, price, description?, imageUrl? }',
            path: ['SEED_PRODUCTS_JSON'],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SEED_PRODUCTS_JSON must be valid JSON',
          path: ['SEED_PRODUCTS_JSON'],
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

function buildDatabaseUrl(): string {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const credentials = `${env.POSTGRES_USER}:${encodeURIComponent(env.POSTGRES_PASSWORD)}`;
  return `postgresql://${credentials}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}?schema=${env.POSTGRES_SCHEMA}`;
}

function buildRedisUrl(): string {
  if (env.REDIS_URL) return env.REDIS_URL;
  return `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;
}

function parseSeedProducts(): Array<z.infer<typeof seedProductSchema>> {
  if (!env.SEED_PRODUCTS_JSON) return [];
  return z.array(seedProductSchema).parse(JSON.parse(env.SEED_PRODUCTS_JSON));
}

const seedConfig = env.RUN_SEED
  ? {
      userEmail: env.SEED_USER_EMAIL!,
      userPassword: env.SEED_USER_PASSWORD!,
      userName: env.SEED_USER_NAME!,
      collectionName: env.SEED_COLLECTION_NAME!,
      products: parseSeedProducts(),
    }
  : {
      userEmail: '',
      userPassword: '',
      userName: '',
      collectionName: '',
      products: [] as Array<z.infer<typeof seedProductSchema>>,
    };

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  appHost: env.APP_HOST,
  appBaseUrl: `http://${env.APP_HOST}:${env.PORT}`,
  apiPrefix: env.API_PREFIX,

  databaseUrl: buildDatabaseUrl(),
  postgres: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    schema: env.POSTGRES_SCHEMA,
  },

  redisUrl: buildRedisUrl(),
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  bcryptRounds: env.BCRYPT_ROUNDS,

  cache: {
    trendingTtlSeconds: env.CACHE_TRENDING_TTL_SECONDS,
    trendingKeyPrefix: env.CACHE_TRENDING_KEY_PREFIX,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  runSeed: env.RUN_SEED,
  seed: seedConfig,

  socket: {
    corsOrigin: env.SOCKET_CORS_ORIGIN,
    path: env.SOCKET_PATH,
    roomPrefix: env.SOCKET_ROOM_PREFIX,
  },

  logLevel: env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug'),
};
