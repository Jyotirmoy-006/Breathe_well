/**
 * @file schema.test.ts
 * @description Unit tests for AI response schema validation and unquantified safety enforcement.
 */

import { describe, expect, it } from 'vitest';

import { validateAiResponse } from '@/domain/ai';
import type { StructuredAiResponse } from '@/domain/ai';
import { isErr, isOk } from '@/domain/result';

describe('AI Schema Validation', () => {
  const validResponse: StructuredAiResponse = {
    dayNarrative: 'Air quality is very challenging today with winter smog. Keep windows closed.',
    actionRationales: [
      {
        actionId: 'routine-n95-commute',
        personalRationale: 'Protects lungs on your bike commute.',
      },
    ],
    communityTalkingPoints: [
      'Propose society-wide night heater support for guards to avoid open fires.',
    ],
    aiSuggestions: [
      {
        title: 'Draft blocker under doors',
        explanation: 'Use rolled blankets along balcony door cracks.',
        flaggedAsUnquantified: true,
      },
    ],
  };

  it('accepts valid structured AI output', () => {
    const result = validateAiResponse(validResponse);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.dayNarrative).toContain('smog');
      expect(result.value.aiSuggestions[0]?.flaggedAsUnquantified).toBe(true);
    }
  });

  it('rejects suggestions missing flaggedAsUnquantified = true', () => {
    const malformed = {
      ...validResponse,
      aiSuggestions: [
        {
          title: 'Draft blocker',
          explanation: 'Use rolled blankets',
          flaggedAsUnquantified: false,
        },
      ],
    };
    expect(isErr(validateAiResponse(malformed))).toBe(true);
  });

  it('rejects dayNarrative that is too short or too long', () => {
    const tooShort = { ...validResponse, dayNarrative: 'Bad air.' };
    expect(isErr(validateAiResponse(tooShort))).toBe(true);

    const tooLong = { ...validResponse, dayNarrative: 'a'.repeat(801) };
    expect(isErr(validateAiResponse(tooLong))).toBe(true);
  });

  it('rejects non-object and null responses', () => {
    expect(isErr(validateAiResponse(null))).toBe(true);
    expect(isErr(validateAiResponse('plain text string'))).toBe(true);
    expect(isErr(validateAiResponse([]))).toBe(true);
  });
});
