/**
 * @file geminiClient.ts
 * @description Server-side Gemini client using @google/genai SDK with retry and schema validation.
 * Enforces strict 8s timeout, single retry on 429/503, JSON schema parsing, and guardrail enforcement.
 */

import { GoogleGenAI } from '@google/genai';

import { validateAiResponse } from '@/domain/ai/schema';
import type { StructuredAiResponse } from '@/domain/ai/schema';
import { err, ok } from '@/domain/result';
import type { Result } from '@/domain/result';
import { env } from '@/server/env';
import { logger } from '@/server/logger';

/** Timeout in milliseconds for Gemini API requests: 8 seconds. */
export const GEMINI_TIMEOUT_MS = 8_000 as const;

/** Exponential backoff delay for transient retries: 1 second. */
export const RETRY_DELAY_MS = 1_000 as const;

export type GeminiErrorCode =
  | 'AI_NOT_CONFIGURED'
  | 'GEMINI_TIMEOUT'
  | 'SCHEMA_VALIDATION_ERROR'
  | 'TRANSIENT_ERROR'
  | 'GUARDRAIL_VIOLATION'
  | 'API_ERROR';

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message;
    return msg.includes('429') || msg.includes('503') || msg.includes('RESOURCE_EXHAUSTED');
  }
  return false;
}

function cleanResponseText(rawText: string): string {
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

const MEDICAL_TERMS = ['prescribe', 'diagnose', 'diagnosis', 'dosage', 'milligram', 'antibiotic'];

function checkGuardrails(response: StructuredAiResponse): boolean {
  const combined = [
    response.dayNarrative,
    ...response.actionRationales.map((r) => r.personalRationale),
    ...response.communityTalkingPoints,
  ]
    .join(' ')
    .toLowerCase();

  for (const term of MEDICAL_TERMS) {
    if (combined.includes(term)) {
      return false;
    }
  }
  return true;
}

async function executeSdkCall(client: GoogleGenAI, prompt: string): Promise<string> {
  const response = await client.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return response.text ?? '';
}

async function callWithTimeout(client: GoogleGenAI, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('GEMINI_TIMEOUT'));
    }, GEMINI_TIMEOUT_MS);

    executeSdkCall(client, prompt)
      .then((text) => {
        clearTimeout(timer);
        resolve(text);
      })
      .catch((errCall: unknown) => {
        clearTimeout(timer);
        reject(errCall instanceof Error ? errCall : new Error(String(errCall)));
      });
  });
}

async function executeWithRetry(client: GoogleGenAI, prompt: string): Promise<string> {
  try {
    return await callWithTimeout(client, prompt);
  } catch (firstError) {
    if (isTransientError(firstError)) {
      logger.warn('Transient Gemini failure, retrying once...', { error: firstError });
      await new Promise((res) => {
        setTimeout(res, RETRY_DELAY_MS);
      });
      return await callWithTimeout(client, prompt);
    }
    throw firstError;
  }
}

/**
 * Requests structured lifestyle guidance from Gemini with safety guards and schema validation.
 *
 * @param prompt - Delimiter-protected, sanitized prompt.
 * @returns Result containing validated StructuredAiResponse or typed error code.
 */
export async function requestGeminiPersonalization(
  prompt: string,
): Promise<Result<StructuredAiResponse, GeminiErrorCode>> {
  if (!env.GEMINI_API_KEY) {
    return err('AI_NOT_CONFIGURED');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const rawText = await executeWithRetry(ai, prompt);
    const cleaned = cleanResponseText(rawText);
    const parsedJson: unknown = JSON.parse(cleaned);

    const validationResult = validateAiResponse(parsedJson);
    if (!validationResult.ok) {
      logger.warn('Gemini response failed schema validation', { error: validationResult.error });
      return err('SCHEMA_VALIDATION_ERROR');
    }

    if (!checkGuardrails(validationResult.value)) {
      logger.warn('Gemini response violated medical advice guardrail');
      return err('GUARDRAIL_VIOLATION');
    }

    return ok(validationResult.value);
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('GEMINI_TIMEOUT')) {
      return err('GEMINI_TIMEOUT');
    }
    if (isTransientError(error)) {
      return err('TRANSIENT_ERROR');
    }
    logger.error('Gemini invocation error', { error });
    return err('API_ERROR');
  }
}
