/**
 * @file chatDomain.test.ts
 * @description Unit tests for chatGuardrail and chatPrompt domain functions.
 */

import { describe, expect, it } from 'vitest';

import {
  generateDeterministicChatAnswer,
  isMedicalAdviceQuestion,
  MEDICAL_REFUSAL_TEXT,
} from '@/domain/ai/chatGuardrail';
import { buildGroundedChatPrompt } from '@/domain/ai/chatPrompt';

describe('chatGuardrail', () => {
  it('detects medical advice queries with prescription or dosage keywords', () => {
    expect(isMedicalAdviceQuestion('What dosage of cetirizine should I take?')).toBe(true);
    expect(isMedicalAdviceQuestion('Can you prescribe antibiotics for my cough?')).toBe(true);
    expect(isMedicalAdviceQuestion('How many milligram of paracetamol?')).toBe(true);
    expect(isMedicalAdviceQuestion('Please diagnose my bronchitis')).toBe(true);
    expect(isMedicalAdviceQuestion('Can you give me a remedy for asthma?')).toBe(true);
  });

  it('allows non-medical lifestyle and environmental questions', () => {
    expect(isMedicalAdviceQuestion('Is it safe for my child to play outdoors?')).toBe(false);
    expect(isMedicalAdviceQuestion('How do I clean my DIY box fan filter?')).toBe(false);
    expect(isMedicalAdviceQuestion('What is the best time to ventilate?')).toBe(false);
  });

  it('generates grounded deterministic answers across all supported query categories and AQI tiers', () => {
    // Child / outdoor query
    expect(generateDeterministicChatAnswer('outdoor play for child', 'Severe')).toContain(
      'outdoor physical exertion for children should be strictly avoided',
    );
    expect(generateDeterministicChatAnswer('outdoor play for child', 'Poor')).toContain(
      'Outdoor activity for children should be curtailed',
    );
    expect(generateDeterministicChatAnswer('outdoor play for child', 'Good')).toContain(
      'Air quality is within acceptable bounds',
    );

    // Filter maintenance query
    expect(generateDeterministicChatAnswer('How to maintain my air purifier filter?')).toContain(
      'Corsi-Rosenthal box',
    );

    // Mask query
    expect(generateDeterministicChatAnswer('Which mask should I wear?')).toContain('N95, FFP2');

    // Default query
    expect(generateDeterministicChatAnswer('What should I do today?', 'Very Poor')).toContain(
      'Based on your personalized plan for Very Poor air quality',
    );
  });

  it('exports valid standard medical refusal text', () => {
    expect(MEDICAL_REFUSAL_TEXT).toContain('not a medical doctor');
    expect(MEDICAL_REFUSAL_TEXT).toContain('cannot provide medical advice');
  });
});

describe('chatPrompt', () => {
  it('builds grounded prompt with safe context serialization', () => {
    const prompt = buildGroundedChatPrompt({
      question: 'When should I open windows?',
      planContext: { aqiCategory: 'Severe', currentPm25: 350 },
      aqiSummary: { category: 'Severe' },
    });

    expect(prompt).toContain('SaafSaans (साफ़ साँस) Follow-up Assistant');
    expect(prompt).toContain('STRICT GROUNDING & SAFETY RULES:');
    expect(prompt).toContain('When should I open windows?');
    expect(prompt).toContain('"aqiCategory":"Severe"');
  });

  it('handles empty context gracefully', () => {
    const prompt = buildGroundedChatPrompt({
      question: 'General question?',
    });

    expect(prompt).toContain('None provided');
    expect(prompt).toContain('General question?');
  });
});
