/**
 * @file communityActions.ts
 * @description Curated community and civic actions for residential societies, schools, and neighborhood RWAs.
 */

import type { ActionCatalogEntry } from './types';

/**
 * Community interventions mobilizing neighborhood resident welfare associations (RWAs) and institutions.
 */
export const COMMUNITY_ACTIONS: readonly ActionCatalogEntry[] = [
  {
    id: 'community-school-indoor-assembly',
    title: 'Move school assembly and sports indoors on Severe days',
    description:
      'Petition school management to move morning assemblies and physical education classes indoors during high AQI.',
    category: 'community',
    effort: 2,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: { minAqiCategory: ['Poor', 'Very Poor', 'Severe'] },
    coefficients: {
      pm25ExposureReductionPct: { low: 30, high: 60 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Protects children from high minute-volume lung deposition during morning inversion',
      confidence: 'high',
    },
    evidenceNotes:
      'Delhi Directorate of Education winter pollution advisories; WHO pediatric air guidelines.',
  },
  {
    id: 'community-guard-electric-heaters',
    title: 'RWA electric heater provision for security guards',
    description:
      'Provide electric radiant heaters in guard booths so guards do not burn wood or plastics to stay warm.',
    category: 'community',
    effort: 1,
    cost: 'low',
    timeBlock: 'night',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 25, high: 50 },
      co2eKgPerWeek: { low: 4, high: 9 },
      basis: 'Direct abatement of localized open night bonfires at society perimeter gates',
      confidence: 'high',
    },
    evidenceNotes: 'CAQM directives to RWAs on night security warming measures.',
  },
  {
    id: 'community-anti-burning-patrol',
    title: 'Neighborhood anti-burning vigil & reporting',
    description:
      'Organize resident evening walks to monitor open waste burning and report violations via Green Delhi app.',
    category: 'community',
    effort: 2,
    cost: 'free',
    timeBlock: 'evening',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 15, high: 35 },
      co2eKgPerWeek: { low: 2, high: 5 },
      basis: 'Civic vigilance creating deterrence against fugitive ground-level open fires',
      confidence: 'medium',
    },
    evidenceNotes: 'Green Delhi App civic intervention audit reports.',
  },
  {
    id: 'community-dust-misting',
    title: 'Water misting on internal society roads',
    description:
      'Use society garden hoses or mist sprinklers to suppress dust on unpaved internal walking tracks twice daily.',
    category: 'community',
    effort: 1,
    cost: 'low',
    timeBlock: 'morning',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 25 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Moisture binding preventing mechanical tyre and wind dust re-entrainment',
      confidence: 'medium',
    },
    evidenceNotes: 'CPCB Guidelines on dust control and anti-smog misting deployment.',
  },
  {
    id: 'community-air-curtains',
    title: 'Install entrance air curtains or double-door vestibules',
    description:
      'Equip society clubhouse and residential tower lobbies with air curtains to cut particulate infiltration.',
    category: 'community',
    effort: 2,
    cost: 'medium',
    timeBlock: 'all_day',
    eligibilityRules: { maxBudget: 'medium' },
    coefficients: {
      pm25ExposureReductionPct: { low: 15, high: 30 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'High-velocity planar air stream isolating outdoor particulate ingress at doorways',
      confidence: 'high',
    },
    evidenceNotes: 'ASHRAE Fundamentals Handbook on building infiltration vestibules.',
  },
  {
    id: 'community-staff-n95-distribution',
    title: 'RWA N95 mask distribution to sanitation staff',
    description:
      'Provide certified N95 masks to society sanitation workers, gardeners, and guards facing outdoor exposure.',
    category: 'community',
    effort: 1,
    cost: 'low',
    timeBlock: 'morning',
    eligibilityRules: { maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 50, high: 80 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Occupational health mitigation for high-exposure frontline workers',
      confidence: 'high',
    },
    evidenceNotes: 'National Institute for Occupational Safety and Health (NIOSH) guidance.',
  },
  {
    id: 'community-bulk-hepa-purchase',
    title: 'Bulk society procurement of HEPA replacement filters',
    description:
      'Pool resident orders to negotiate 30-40% discounts on HEPA purifier replacement filters.',
    category: 'community',
    effort: 2,
    cost: 'free',
    timeBlock: 'all_day',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 20, high: 45 },
      co2eKgPerWeek: { low: 0, high: 0 },
      basis: 'Economics of scale enabling continuous filter maintenance across apartments',
      confidence: 'medium',
    },
    evidenceNotes: 'Consumer collective bargaining and indoor air intervention compliance studies.',
  },
  {
    id: 'community-carpool-pledge',
    title: 'Society school-run and office carpool network',
    description:
      'Create a society WhatsApp group to coordinate shared morning school drops and metro station shuttle rides.',
    category: 'community',
    effort: 2,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 10, high: 25 },
      co2eKgPerWeek: { low: 8, high: 18 },
      basis: 'Reduction of peak-hour vehicular trips and localized congestion plume',
      confidence: 'high',
    },
    evidenceNotes: 'CSE Urban Transport & Clean Air whitepapers on trip consolidation.',
  },
] as const;
