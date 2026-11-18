/**
 * @file env.ts
 * @description Server-side environment validation using Zod.
 * Validates process.env at startup and exports typed constants.
 */

import { z } from 'zod';

const envSchema = z.object({
  /** Optional Gemini API key. When absent, app runs in rule-based mode. */
  GEMINI_API_KEY: z.string().optional(),
  /** Gemini model identifier. Defaults to gemini-2.0-flash. */
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  /** Node environment. */
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `[SaafSaans] Invalid environment configuration:\n${result.error.message}\n\nSee .env.example for required variables.`,
    );
  }
  return result.data;
}

/**
 * Typed, validated environment configuration.
 * Throws at startup if required variables are missing or malformed.
 */
export const env: Env = parseEnv();

/**
 * Whether the AI (Gemini) mode is enabled.
 * True when GEMINI_API_KEY is set and non-empty.
 */
export const isAiEnabled: boolean =
  env.GEMINI_API_KEY !== undefined && env.GEMINI_API_KEY.length > 0;
