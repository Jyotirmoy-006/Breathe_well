/**
 * @file chatGuardrail.ts
 * @description Deterministic guardrails and safe fallback generators for grounded chat Q&A.
 * Refuses medical and medication queries deterministically, and supplies grounded fallback advice.
 */

import { stripNonPrintable } from '../../server/security/sanitize';

/** Medical terms and keywords that trigger immediate deterministic refusal. */
export const MEDICAL_KEYWORDS: readonly string[] = [
  'prescribe',
  'prescription',
  'diagnose',
  'diagnosis',
  'dosage',
  'dose',
  'milligram',
  'antibiotic',
  'steroid',
  'inhaler',
  'pill',
  'tablet',
  'syrup',
  'paracetamol',
  'ibuprofen',
  'montelukast',
  'cetirizine',
  'medicine',
  'medication',
  'cure',
  'remedy for asthma',
];

/** Standard deterministic refusal response for health/medical inquiries. */
export const MEDICAL_REFUSAL_TEXT =
  'I am an air quality and lifestyle planning assistant, not a medical doctor. ' +
  'I cannot provide medical advice, diagnose health conditions, or recommend medications and dosages. ' +
  'If you or a family member are experiencing acute breathing difficulty, wheezing, or chest pain, ' +
  'please consult a qualified healthcare professional or visit an emergency medical facility immediately.';

/**
 * Checks whether an incoming question attempts to solicit medical advice or prescriptions.
 *
 * @param question - The user query string.
 * @returns True if question requests clinical/medical diagnosis or prescription advice.
 */
export function isMedicalAdviceQuestion(question: string): boolean {
  const normalized = stripNonPrintable(question).toLowerCase();
  for (const term of MEDICAL_KEYWORDS) {
    if (normalized.includes(term)) {
      return true;
    }
  }
  return false;
}

function answerChildOutdoorQuestion(aqiCategory: string): string {
  if (aqiCategory === 'Severe' || aqiCategory === 'Very Poor') {
    return (
      'Under current severe smog conditions, outdoor physical exertion for children should be strictly avoided. ' +
      'Keep play indoors in sealed rooms with active filtration. Follow the schedule in Section 04 for safe indoor games.'
    );
  }
  if (aqiCategory === 'Poor' || aqiCategory === 'Moderate') {
    return (
      'Outdoor activity for children should be curtailed, especially during morning and evening rush hours. ' +
      'Check the Section 02 timeline for the best hourly window if outdoor transit is necessary.'
    );
  }
  return 'Air quality is within acceptable bounds. Outdoor play is permitted, but observe sensitive children for any discomfort.';
}

function answerFilterMaintenanceQuestion(): string {
  return (
    'To maintain a DIY box fan filter (Corsi-Rosenthal box): 1) Gently vacuum or brush off surface lint from the outer mesh weekly; ' +
    '2) Keep duct-tape seals completely airtight around fan corners; 3) Replace MERV-13/HEPA filters every 60-90 days during peak winter smog.'
  );
}

function answerMaskQuestion(): string {
  return (
    'Standard cloth and surgical masks do not filter PM2.5 particulates. ' +
    'Wear a well-fitted ISI/NIOSH certified N95, FFP2, or KN95 respirator with a snug nose seal whenever stepping outside during smog peaks.'
  );
}

function answerDefaultGroundedQuestion(aqiCategory: string): string {
  return (
    `Based on your personalized plan for ${aqiCategory} air quality: follow the time-blocked routine in Section 04, ` +
    'keep external doors and windows sealed during rush hours, use damp mopping to suppress indoor dust, ' +
    'and check Section 05 to see how your selected actions reduce daily inhaled PM2.5.'
  );
}

const CHILD_OUTDOOR_REGEX = /child|play|outdoor/i;
const FILTER_REGEX = /filter|purifier|maintain/i;
const MASK_REGEX = /mask|n95|respirator/i;

/**
 * Generates a deterministic, factual response grounded in CPCB guidelines and the current plan.
 * Used when Gemini is not configured or in safe offline fallback mode.
 *
 * @param question - The user's query string.
 * @param aqiCategory - The current AQI tier category string.
 * @returns Factual grounded guidance string.
 */
export function generateDeterministicChatAnswer(question: string, aqiCategory = 'Severe'): string {
  if (CHILD_OUTDOOR_REGEX.test(question)) {
    return answerChildOutdoorQuestion(aqiCategory);
  }
  if (FILTER_REGEX.test(question)) {
    return answerFilterMaintenanceQuestion();
  }
  if (MASK_REGEX.test(question)) {
    return answerMaskQuestion();
  }
  return answerDefaultGroundedQuestion(aqiCategory);
}
