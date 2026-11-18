/**
 * @file chatStream.ts
 * @description Streaming orchestrator for grounded follow-up chat Q&A using @google/genai.
 * Returns a ReadableStream of text chunks with deterministic guardrail and offline fallbacks.
 */

import { GoogleGenAI } from '@google/genai';

import {
  generateDeterministicChatAnswer,
  isMedicalAdviceQuestion,
  MEDICAL_REFUSAL_TEXT,
} from '../../domain/ai/chatGuardrail';
import { buildGroundedChatPrompt } from '../../domain/ai/chatPrompt';
import type { GroundedChatPromptInput } from '../../domain/ai/chatPrompt';
import { env } from '../env';
import { logger } from '../logger';

/**
 * Creates a standard Web ReadableStream emitting the provided plain text.
 *
 * @param text - The string content to stream.
 * @returns ReadableStream of encoded bytes.
 */
export function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function extractAqiCategory(aqiSummary?: Record<string, unknown>): string {
  if (aqiSummary && typeof aqiSummary.category === 'string') {
    return aqiSummary.category;
  }
  return 'Severe';
}

async function streamFromGemini(
  apiKey: string,
  prompt: string,
  fallbackText: string,
): Promise<ReadableStream<Uint8Array>> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1beta' },
  });
  const encoder = new TextEncoder();

  try {
    const streamResult = await ai.models.generateContentStream({
      model: env.GEMINI_MODEL,
      contents: prompt,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            const piece = chunk.text;
            if (piece) {
              controller.enqueue(encoder.encode(piece));
            }
          }
          controller.close();
        } catch (streamError) {
          logger.warn('Stream interrupted, emitting fallback', { error: streamError });
          controller.enqueue(encoder.encode(`\n${fallbackText}`));
          controller.close();
        }
      },
    });
  } catch (error) {
    logger.warn('Gemini stream initialization failed, using fallback', { error });
    return createTextStream(fallbackText);
  }
}

/**
 * Processes a chat follow-up query, applying medical guardrails and streaming the response.
 *
 * @param input - The user query, plan context, and current air quality metrics.
 * @returns ReadableStream of encoded UTF-8 chunks.
 */
export async function streamChatResponse(
  input: GroundedChatPromptInput,
): Promise<ReadableStream<Uint8Array>> {
  const { question, planContext, aqiSummary } = input;

  // 1. Deterministic medical advice guardrail check
  if (isMedicalAdviceQuestion(question)) {
    logger.info('Medical advice question blocked by guardrail', { question });
    return createTextStream(MEDICAL_REFUSAL_TEXT);
  }

  // 2. Prepare fallback deterministic text
  const aqiCategory = extractAqiCategory(aqiSummary);
  const fallback = generateDeterministicChatAnswer(question, aqiCategory);

  // 3. Fall back immediately if Gemini is not configured
  if (!env.GEMINI_API_KEY) {
    return createTextStream(fallback);
  }

  // 4. Stream response via Gemini
  const prompt = buildGroundedChatPrompt({ question, planContext, aqiSummary });
  return streamFromGemini(env.GEMINI_API_KEY, prompt, fallback);
}
