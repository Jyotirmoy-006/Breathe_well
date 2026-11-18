/**
 * @file homeActions.ts
 * @description Curated home air actions targeting indoor filtration, combustion avoidance, and ventilation.
 */

import type { ActionCatalogEntry } from './types';

/**
 * Curated indoor air quality interventions for living and sleeping spaces.
 */
export const HOME_ACTIONS: readonly ActionCatalogEntry[] = [
  {
    id: 'home-diy-box-fan-hepa',
    title: 'DIY Corsi-Rosenthal box fan air cleaner',
    description:
      'Build a high-CADR air cleaner using a standard box fan sealed tightly to MERV 13 or HEPA panel filters.',
    category: 'home',
    effort: 2,
    cost: 'low',
    timeBlock: 'all_day',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 40, high: 75 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'High clean air delivery rate (CADR) in closed room microenvironments',
      confidence: 'high',
    },
    evidenceNotes: 'UC Davis and US EPA evaluations of Corsi-Rosenthal box air cleaners.',
  },
  {
    id: 'home-cross-ventilation-midday',
    title: 'Timed cross-ventilation during peak dispersion',
    description:
      'Flush stale indoor CO2 by opening opposite windows for 20 minutes between 1 PM and 3 PM.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'midday',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 20 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Controlled air exchange during lowest diurnal ambient PM2.5 window',
      confidence: 'medium',
    },
    evidenceNotes: 'CPCB and building ventilation engineering benchmarks.',
  },
  {
    id: 'home-avoid-incense',
    title: 'Eliminate indoor agarbatti and mosquito coils',
    description:
      'Cease burning incense sticks, dhoop, and mosquito coils which emit extreme PM2.5 spikes up to 300 µg/m³.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'evening',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 20, high: 50 },
      co2eKgPerWeek: { low: 0.1, high: 0.3 },
      basis: 'Direct indoor solid combustion source elimination',
      confidence: 'high',
    },
    evidenceNotes: 'Lin et al. (2008); WHO indoor air quality guidelines on combustion products.',
  },
  {
    id: 'home-kitchen-exhaust',
    title: 'Operate kitchen exhaust with kitchen door shut',
    description:
      'Run kitchen chimney or high-speed exhaust during frying and tadka while isolating living spaces.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 15, high: 35 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Fume containment and negative pressure extraction of cooking aerosols',
      confidence: 'high',
    },
    evidenceNotes: 'Lawrence Berkeley National Laboratory cooking aerosol exposure studies.',
  },
  {
    id: 'home-snake-spider-plants',
    title: 'Indoor spider and snake plants',
    description:
      'Place Sansevieria and spider plants in bedrooms to support micro-humidity and VOC adsorption.',
    category: 'home',
    effort: 1,
    cost: 'low',
    timeBlock: 'all_day',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 2, high: 5 },
      co2eKgPerWeek: { low: 0.05, high: 0.1 },
      basis: 'Phytoremediation in closed residential microenvironments',
      confidence: 'assumption',
    },
    evidenceNotes:
      'NASA Clean Air Study (Note: particulate capture is minimal; explicitly assumption).',
  },
  {
    id: 'home-close-balcony-inversion',
    title: 'Lock balcony doors during evening inversion',
    description:
      'Keep balcony and terrace doors sealed shut from 6 PM to 9 AM against nocturnal stagnation layer.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'night',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 15, high: 30 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Barrier against boundary layer particulate buildup at ground level',
      confidence: 'high',
    },
    evidenceNotes: 'SAFAR and IMD nocturnal thermal inversion monitoring data.',
  },
  {
    id: 'home-purifier-high-peak',
    title: 'Run HEPA purifier on boost mode during peak hours',
    description:
      'Ramp air purifier to high fan setting between 7 PM and 11 PM when outdoor air surges.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'evening',
    eligibilityRules: { hasPurifier: true },
    coefficients: {
      pm25ExposureReductionPct: { low: 30, high: 60 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Maximizing air changes per hour (ACH) through True HEPA filtration',
      confidence: 'high',
    },
    evidenceNotes: 'AHAM AC-1 CADR testing standards and indoor air filtration trials.',
  },
  {
    id: 'home-hepa-vacuum',
    title: 'Damp cleaning over exhaust vacuuming',
    description:
      'Avoid unsealed vacuum cleaners that recirculate fine particulate exhaust back into the room.',
    category: 'home',
    effort: 1,
    cost: 'free',
    timeBlock: 'midday',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 20 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Prevention of sub-micron motor and bin particulate blow-through',
      confidence: 'medium',
    },
    evidenceNotes: 'Knibbs et al. (2012) Vacuum cleaner particulate emission characteristics.',
  },
] as const;
