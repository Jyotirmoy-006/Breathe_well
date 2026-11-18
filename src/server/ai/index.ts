/**
 * @file index.ts
 * @description Central export point for AI integration and plan orchestration.
 */

export { requestGeminiPersonalization, GEMINI_TIMEOUT_MS, RETRY_DELAY_MS } from './geminiClient';
export type { GeminiErrorCode } from './geminiClient';

export { orchestratePlan, SEVERE_MEDICAL_ADVISORY } from './generatePlan';
export type { OrchestratedPlan, PlanMetadata, OrchestratedPlanResult } from './generatePlan';
