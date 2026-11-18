/**
 * @file swapActions.ts
 * @description Curated sustainable swap actions replacing polluting fuels, transport, and equipment.
 */

import type { ActionCatalogEntry } from './types';

/**
 * Sustainable swaps delivering dual benefits of immediate PM2.5 protection and long-term carbon reduction.
 */
export const SWAP_ACTIONS: readonly ActionCatalogEntry[] = [
  {
    id: 'swap-biomass-to-induction',
    title: 'Shift solid fuel/coal to induction cooktop',
    description:
      'Replace biomass, wood chulha, or coal cooking with clean electric induction or LPG cylinders.',
    category: 'swap',
    effort: 3,
    cost: 'medium',
    timeBlock: 'all_day',
    eligibilityRules: { maxBudget: 'medium' },
    coefficients: {
      pm25ExposureReductionPct: { low: 70, high: 90 },
      co2eKgPerWeek: { low: 15, high: 28 },
      basis: 'Complete replacement of incomplete solid fuel combustion with electricity',
      confidence: 'high',
    },
    evidenceNotes:
      'WHO Guidelines for indoor air quality: household fuel combustion; IPCC emission factors.',
  },
  {
    id: 'swap-electric-heater-angithi',
    title: 'Replace open coal angithi with electric heater',
    description:
      'Swap open burning charcoal or wood angithi space heating with radiant oil-filled electric heaters.',
    category: 'swap',
    effort: 2,
    cost: 'medium',
    timeBlock: 'night',
    eligibilityRules: { needsHeating: true, maxBudget: 'medium' },
    coefficients: {
      pm25ExposureReductionPct: { low: 60, high: 85 },
      co2eKgPerWeek: { low: 8, high: 16 },
      basis: 'Elimination of indoor carbon monoxide and black carbon particulate emissions',
      confidence: 'high',
    },
    evidenceNotes: 'CPCB and Ministry of Environment winter source apportionment reports.',
  },
  {
    id: 'swap-carpool-electric-bus',
    title: 'Shift solo car commute to metro or electric bus',
    description:
      'Replace single-occupancy petrol or diesel car driving with Delhi Metro or electric transit buses.',
    category: 'swap',
    effort: 2,
    cost: 'free',
    timeBlock: 'commute',
    eligibilityRules: { needsCar: true },
    coefficients: {
      pm25ExposureReductionPct: { low: 20, high: 40 },
      co2eKgPerWeek: { low: 12, high: 25 },
      basis: 'Modal shift from passenger vehicle to electric transit grid per 100 passenger-km',
      confidence: 'high',
    },
    evidenceNotes:
      'Bureau of Energy Efficiency (BEE) and Delhi Metro DMRC carbon abatement reports.',
  },
  {
    id: 'swap-two-wheeler-to-metro',
    title: 'Switch two-wheeler commute to metro transit',
    description:
      'Switch open two-wheeler bike travel to air-conditioned underground and elevated metro train transit.',
    category: 'swap',
    effort: 2,
    cost: 'low',
    timeBlock: 'commute',
    eligibilityRules: { needsTwoWheeler: true },
    coefficients: {
      pm25ExposureReductionPct: { low: 50, high: 75 },
      co2eKgPerWeek: { low: 4, high: 8 },
      basis: 'Air-conditioned filtered transit cabin versus open roadway tailpipe exposure',
      confidence: 'high',
    },
    evidenceNotes: 'Centre for Science and Environment (CSE) commuter exposure studies.',
  },
  {
    id: 'swap-stop-waste-burning',
    title: 'Zero open waste burning',
    description:
      'Hand over household waste to authorized municipal door-to-door sanitation collectors instead of burning.',
    category: 'swap',
    effort: 1,
    cost: 'free',
    timeBlock: 'evening',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 40, high: 70 },
      co2eKgPerWeek: { low: 6, high: 14 },
      basis:
        'Avoidance of direct polycyclic aromatic hydrocarbon and dioxin emissions from open burn',
      confidence: 'high',
    },
    evidenceNotes:
      'CPCB Solid Waste Management Rules 2016; US EPA emission factors for open burning.',
  },
  {
    id: 'swap-stop-leaf-burning',
    title: 'Compost garden leaves instead of burning',
    description:
      'Mulch and compost autumn garden leaves and horticultural waste into soil conditioner rather than bonfire.',
    category: 'swap',
    effort: 2,
    cost: 'free',
    timeBlock: 'midday',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: 25, high: 50 },
      co2eKgPerWeek: { low: 3, high: 7 },
      basis: 'Aerobic microbial decomposition preventing open pyrolytic smoke generation',
      confidence: 'high',
    },
    evidenceNotes: 'Indian Agricultural Research Institute (IARI) biomass management guidelines.',
  },
  {
    id: 'swap-electric-blanket',
    title: 'Low-wattage electric blanket over room space heater',
    description:
      'Use a 60W heated under-blanket during sleep instead of running a 2000W continuous convection blower.',
    category: 'swap',
    effort: 1,
    cost: 'low',
    timeBlock: 'night',
    eligibilityRules: { needsHeating: true, maxBudget: 'low' },
    coefficients: {
      pm25ExposureReductionPct: { low: 0, high: 0 },
      co2eKgPerWeek: { low: 5, high: 10 },
      basis: 'Direct micro-climate body warming reducing electricity consumption by 90%',
      confidence: 'high',
    },
    evidenceNotes: 'Bureau of Energy Efficiency domestic space heating thermal comfort data.',
  },
  {
    id: 'swap-dg-to-solar-battery',
    title: 'Replace diesel generator with solar inverter battery',
    description:
      'Utilize lithium or tubular inverter battery power backup during outages instead of diesel generator.',
    category: 'swap',
    effort: 3,
    cost: 'high',
    timeBlock: 'all_day',
    eligibilityRules: { maxBudget: 'high' },
    coefficients: {
      pm25ExposureReductionPct: { low: 30, high: 60 },
      co2eKgPerWeek: { low: 10, high: 22 },
      basis:
        'Elimination of heavy diesel genset soot (PM2.5, NOx, SO2) emissions in residential complex',
      confidence: 'high',
    },
    evidenceNotes:
      'CPCB Genset Emission Norms & Commission for Air Quality Management (CAQM) directives.',
  },
] as const;
