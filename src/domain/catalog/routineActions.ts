/**
 * @file routineActions.ts
 * @description Curated routine behavioral actions for personal and household exposure reduction.
 */

import type { ActionCatalogEntry } from './types';

/**
 * Routine daily actions targeting exposure timing, personal protection, and habits.
 */
export const ROUTINE_ACTIONS: readonly ActionCatalogEntry[] = [
  {
    id: 'routine-morning-ventilation',
    title: 'Midday ventilation window',
    description:
      'Open windows only between 12 PM and 3 PM when solar radiation breaks ground-level inversion.',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'midday',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 20 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Boundary-layer dispersion dynamics and thermal inversion breakdown',
      confidence: 'medium',
    },
    evidenceNotes: 'CPCB & IIT Delhi meteorological boundary-layer dispersion studies.',
  },
  {
    id: 'routine-midday-exercise',
    title: 'Shift outdoor exertion to midday',
    description:
      'Reschedule jogging and outdoor workouts to 1 PM - 4 PM when diurnal ambient PM2.5 reaches daily lows.',
    category: 'routine',
    effort: 2,
    cost: 'free',
    timeBlock: 'midday',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 25, high: 45 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Diurnal ambient concentration variation in Northern plains',
      confidence: 'high',
    },
    evidenceNotes: 'WHO Air Quality Guidelines 2021; SAFAR Delhi diurnal PM2.5 monitoring.',
  },
  {
    id: 'routine-seal-windows',
    title: 'Seal window gaps and door sweeps',
    description:
      'Apply foam weatherstripping tape or damp rolled towels along exterior door cracks and windows.',
    category: 'routine',
    effort: 1,
    cost: 'low',
    timeBlock: 'morning',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 15, high: 30 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Reduction of outdoor air infiltration through building envelope cracks',
      confidence: 'medium',
    },
    evidenceNotes: 'US EPA Indoor Air Quality Guidelines on building envelope tightness.',
  },
  {
    id: 'routine-wet-mopping',
    title: 'Wet-mopping over dry-sweeping',
    description:
      'Clean floors using damp microfiber mops instead of dry brooms to prevent resuspending settled fine dust.',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 25 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Avoidance of mechanical particle resuspension indoors',
      confidence: 'high',
    },
    evidenceNotes: 'CPCB Guidelines on indoor dust control and particulate resuspension.',
  },
  {
    id: 'routine-n95-commute',
    title: 'Wear fitted N95 respirator on commute',
    description:
      'Wear a certified N95 or FFP2 respirator with tight seal during public transit and outdoor travel.',
    category: 'routine',
    effort: 1,
    cost: 'low',
    timeBlock: 'commute',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 50, high: 80 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Filtration efficiency of NIOSH N95 electrostatically charged media',
      confidence: 'high',
    },
    evidenceNotes: 'NIOSH & WHO personal protective equipment filtration benchmarks.',
  },
  {
    id: 'routine-car-recirc',
    title: 'Car AC recirculation mode',
    description:
      'Switch vehicular HVAC to cabin air recirculation mode to block raw road tunnel and tailpipe intake.',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'commute',
    eligibilityRules: { needsCar: true },
    coefficients: {
      pm25ExposureReductionPct: { low: 35, high: 65 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Vehicle cabin filter retention and fresh air ingress isolation',
      confidence: 'high',
    },
    evidenceNotes: 'Peer-reviewed cabin particulate studies (Hudda et al., 2012).',
  },
  {
    id: 'routine-shoes-outside',
    title: 'Keep footwear outside living areas',
    description:
      'Leave street shoes at the entrance shoe rack to prevent tracking heavy road dust and soot onto rugs.',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'evening',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 5, high: 15 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Mitigation of secondary track-in particulate reservoirs',
      confidence: 'medium',
    },
    evidenceNotes: 'US EPA studies on soil and dust track-in prevention.',
  },
  {
    id: 'routine-clean-ac-filters',
    title: 'Clean split AC pre-filters weekly',
    description:
      'Wash and dry mesh dust pre-filters of room AC units weekly to maintain optimum airflow and basic capture.',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 5, high: 12 },
      co2eKgPerWeek: { low: 0.2, high: 0.5 },
      basis: 'HVAC efficiency preservation and coarse particle trapping',
      confidence: 'medium',
    },
    evidenceNotes: 'ASHRAE filtration maintenance guidelines.',
  },
] as const;
