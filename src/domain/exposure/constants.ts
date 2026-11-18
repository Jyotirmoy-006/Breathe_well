/**
 * @file constants.ts
 * @description Infiltration and microenvironmental penetration factors for PM2.5 exposure modeling.
 */

/** Infiltration factor for typical urban Indian home without HEPA purifier. */
export const INFILTRATION_INDOORS_HOME_NO_PURIFIER = 0.5;

/** Infiltration factor for indoor home equipped with operational True HEPA purifier. */
export const INFILTRATION_INDOORS_HOME_WITH_PURIFIER = 0.15;

/** Microenvironmental penetration factor for air-conditioned metro / train transit. */
export const INFILTRATION_TRANSIT_METRO = 0.4;

/** Microenvironmental penetration factor for private vehicle with AC recirculation on. */
export const INFILTRATION_TRANSIT_CAR_RECIRC = 0.3;

/** Microenvironmental penetration factor for open commute (two-wheeler, walking, bicycle). */
export const INFILTRATION_TRANSIT_OPEN = 0.95;

/** Microenvironmental penetration factor for unshielded outdoor exposure. */
export const INFILTRATION_OUTDOORS = 1.0;

/** Default commuter transit hours (08:00, 09:00, 18:00, 19:00). */
export const DEFAULT_COMMUTE_HOURS: readonly number[] = [8, 9, 18, 19];

/** Default evening outdoor recreational hours (17:00). */
export const DEFAULT_OUTDOOR_HOURS: readonly number[] = [17];
