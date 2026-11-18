/**
 * @file sanitize.ts
 * @description Input sanitization and hostile prompt injection defense utilities.
 * Strips non-printable characters, zero-width spaces, and isolates prompt delimiters.
 */

const NON_PRINTABLE_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;
const BIDI_OVERRIDE_REGEX = /[\u202A-\u202E\u2066-\u2069]/g;
const PROMPT_DELIMITER_REGEX = /<<<|>>>/g;

const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(prompts|instructions)/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|dan|unfiltered)/i,
  /bypass\s+(content\s+filter|guardrails|safety)/i,
  /system\s+override/i,
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
];

/**
 * Removes non-printable characters, zero-width spaces, and bidi override codes from raw text.
 *
 * @param input - Untrusted user input.
 * @returns Cleaned string.
 */
export function stripNonPrintable(input: string): string {
  return input
    .replace(NON_PRINTABLE_REGEX, '')
    .replace(ZERO_WIDTH_REGEX, '')
    .replace(BIDI_OVERRIDE_REGEX, '');
}

/**
 * Escapes sensitive HTML entities to prevent cross-site scripting (XSS).
 *
 * @param input - Raw text string.
 * @returns HTML-safe string.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Detects whether an input text contains known hostile prompt injection or jailbreak phrases.
 *
 * @param text - Untrusted user input string.
 * @returns True if suspicious injection pattern is found.
 */
export function detectPromptInjection(text: string): boolean {
  const normalized = stripNonPrintable(text).toLowerCase();
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes search queries and location query strings.
 *
 * @param query - Raw query text.
 * @param maxLength - Maximum permitted character length (default 100).
 * @returns Trimmed, sanitized query string.
 */
export function sanitizeQuery(query: string, maxLength = 100): string {
  const clean = stripNonPrintable(query).trim();
  const bounded = clean.slice(0, maxLength);
  return bounded.replace(PROMPT_DELIMITER_REGEX, '');
}

/**
 * Sanitizes free-form inputs bound for AI generation prompts, neutralizing prompt delimiters.
 *
 * @param text - Untrusted text for model context.
 * @param maxLength - Maximum allowed length (default 500).
 * @returns Delimiter-neutralized string.
 */
export function sanitizePromptText(text: string, maxLength = 500): string {
  const clean = stripNonPrintable(text).trim();
  const bounded = clean.slice(0, maxLength);
  return bounded.replace(PROMPT_DELIMITER_REGEX, '').replace(/[\r\n]+/g, ' ');
}
