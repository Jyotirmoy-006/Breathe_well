/**
 * @file schema.ts
 * @description Zod schema and validation for structured GenAI responses.
 */

import { z } from 'zod';

import { err, ok } from '../result';
import type { Result } from '../result';

/**
 * Zod schema for an unquantified AI creative suggestion.
 */
export const aiSuggestionSchema = z.object({
  title: z.string().min(2).max(150),
  explanation: z.string().min(5).max(600),
  flaggedAsUnquantified: z.literal(true).default(true),
});

/**
 * Zod schema for an AI-generated personal rationale for a specific catalog action.
 */
export const actionRationaleSchema = z.object({
  actionId: z.string().min(1),
  personalRationale: z.string().min(5).max(400),
});

/**
 * Master Zod schema validating structured GenAI plan narrative and advice.
 */
export const structuredAiResponseSchema = z.object({
  dayNarrative: z.string().min(10).max(800),
  actionRationales: z.array(actionRationaleSchema),
  communityTalkingPoints: z.array(z.string().min(5).max(400)),
  aiSuggestions: z.array(aiSuggestionSchema).default([]),
});

export type StructuredAiResponse = z.infer<typeof structuredAiResponseSchema>;

/**
 * Validates untrusted GenAI JSON outputs against the structured response schema.
 *
 * @param raw - Parsed JSON object from model.
 * @returns Result with validated StructuredAiResponse or formatted error string.
 */
export function validateAiResponse(raw: unknown): Result<StructuredAiResponse, string> {
  const result = structuredAiResponseSchema.safeParse(raw);
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return err(errorMsg);
  }
  return ok(result.data);
}
