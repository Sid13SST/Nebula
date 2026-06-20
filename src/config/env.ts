import * as dotenv from 'dotenv';
import { z } from 'zod';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  HEADLESS: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .default('true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

let validatedEnv;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingOrInvalid = error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${missingOrInvalid}`);
  }
  throw error;
}

export const env = validatedEnv;
export type EnvConfig = typeof env;
