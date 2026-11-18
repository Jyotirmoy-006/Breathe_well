/**
 * @file types.ts
 * @description Types for location search, geocoding coordinates, and selection states.
 */

import type { GeocodingMatch } from '@/server/providers/openMeteoGeocoding';

export type LocationItem = GeocodingMatch;

/**
 * Standard default location: Delhi, National Capital Territory, India.
 */
export const DEFAULT_LOCATION: LocationItem = {
  id: 1273294,
  name: 'Delhi',
  latitude: 28.61,
  longitude: 77.21,
  admin1: 'Delhi',
  country: 'India',
};

export interface LocationComboboxProps {
  readonly selectedLocation: LocationItem;
  readonly onSelectLocation: (loc: LocationItem) => void;
  readonly className?: string;
}
