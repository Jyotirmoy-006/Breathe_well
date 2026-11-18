/**
 * @file types.ts
 * @description Types for the 48-hour timeline forecast, scrubber states, and window analysis.
 */

import type { TimelineWindows } from '@/domain/planner/types';
import type { HourlyAirQualityReading } from '@/server/providers/openMeteoAirQuality';

export type TimelineHour = HourlyAirQualityReading;

export interface TimelineSectionProps {
  readonly hourly: readonly TimelineHour[];
  readonly windows: TimelineWindows;
  readonly selectedIndex: number;
  readonly onSelectIndex: (index: number) => void;
  readonly className?: string;
}
