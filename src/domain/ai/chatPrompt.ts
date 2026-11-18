/**
 * @file chatPrompt.ts
 * @description Secure delimiter-isolated prompt builder for grounded follow-up chat Q&A.
 * Enforces strict grounding in the provided plan and CPCB guidelines, and forbids medical prescriptions.
 */

import { sanitizePromptText } from '../../server/security/sanitize';

/** Input parameters required to construct the grounded chat prompt. */
export interface GroundedChatPromptInput {
  readonly question: string;
  readonly planContext?: Record<string, unknown> | undefined;
  readonly aqiSummary?: Record<string, unknown> | undefined;
}

function formatSafeContext(context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return 'None provided.';
  }
  try {
    const raw = JSON.stringify(context);
    return sanitizePromptText(raw, 1000);
  } catch {
    return 'Context serialization error.';
  }
}

/**
 * Builds an injection-safe, grounded prompt for the Gemini LLM chat streaming assistant.
 *
 * @param input - The user query, plan context, and AQI summary.
 * @returns Fully formatted system and data prompt string.
 */
export function buildGroundedChatPrompt(input: GroundedChatPromptInput): string {
  const safeQuestion = sanitizePromptText(input.question, 300);
  const safePlanContext = formatSafeContext(input.planContext);
  const safeAqi = formatSafeContext(input.aqiSummary);

  return [
    'You are the SaafSaans (साफ़ साँस) Follow-up Assistant.',
    '<<<INSTRUCTIONS>>>',
    'STRICT GROUNDING & SAFETY RULES:',
    '1. STRICT GROUNDING: Answer ONLY using facts from the provided Plan Context and official CPCB winter smog guidelines.',
    '2. ZERO MEDICAL ADVICE: Do NOT prescribe medications, diagnose health conditions, or advise clinical dosages.',
    '3. CONCISE & EMPATHETIC: Keep your answer to 2-4 clear, actionable sentences. No unnecessary filler.',
    '4. NO HALLUCINATION: If the answer cannot be determined from the plan context or CPCB guidelines, politely say so.',
    '<<<END_INSTRUCTIONS>>>',
    '<<<PLAN_CONTEXT>>>',
    `PLAN: ${safePlanContext}`,
    `AQI_SUMMARY: ${safeAqi}`,
    '<<<END_PLAN_CONTEXT>>>',
    '<<<USER_QUESTION>>>',
    safeQuestion,
    '<<<END_USER_QUESTION>>>',
  ].join('\n');
}
