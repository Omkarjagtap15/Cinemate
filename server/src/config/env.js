const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
  TMDB_BASE_URL: z.string().default('https://api.themoviedb.org/3'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/cinemate'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed:', parseResult.error.format());
  // In development, provide fallback defaults if non-critical
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const config = parseResult.success ? parseResult.data : {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  TMDB_API_KEY: process.env.TMDB_API_KEY || '6cd3fd8c162aca4c4446d7f3d546f8cf',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cinemate',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

module.exports = config;
