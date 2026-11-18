/**
 * @file AqiDial.tsx
 * @description Accessible custom SVG circular gauge dial for CPCB AQI, PM2.5, and WHO multiples.
 */

import React from 'react';

import { Badge } from '@/components/ui/Badge';
import type { AqiCategory } from '@/domain/aqi/constants';

export interface AqiDialProps {
  readonly pm25: number;
  readonly pm10: number;
  readonly no2: number;
  readonly aqi: number;
  readonly category: AqiCategory;
  readonly whoMultiple: number;
  readonly className?: string;
}

/**
 * Hand-crafted SVG radial gauge displaying real-time pollutant levels.
 */
export function AqiDial({
  pm25,
  pm10,
  no2,
  aqi,
  category,
  whoMultiple,
  className = '',
}: AqiDialProps): React.JSX.Element {
  const roundedWho = Math.round(whoMultiple * 10) / 10;

  return (
    <div
      role="img"
      aria-label={`Current air quality index: ${String(aqi)}, category ${category}, PM2.5 ${String(pm25)} µg/m³, which is ${String(roundedWho)} times the WHO 24-hour guideline`}
      className={`relative flex flex-col items-center justify-center p-6 bg-white/70 dark:bg-stone-900/70 rounded-2xl border border-stone-300 dark:border-stone-800 backdrop-blur-xs shadow-sm ${className}`}
    >
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {/* Background track (240 deg arc) */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray="335 500"
            strokeDashoffset="-84"
            className="text-stone-200 dark:text-stone-800"
          />
          {/* Colored progress arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={`${String(Math.min(335, (aqi / 500) * 335))} 500`}
            strokeDashoffset="-84"
            strokeLinecap="round"
            className="text-[#1A5341] dark:text-[#2DD4BF] transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            CPCB AQI
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-serif text-stone-900 dark:text-stone-100">
            {aqi}
          </span>
          <div className="mt-1">
            <Badge variant={category} size="sm">
              {category}
            </Badge>
          </div>
        </div>
      </div>

      {/* WHO Guideline Multiple Banner */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
          ⚠️ {roundedWho}× WHO 24h Guideline
        </p>
      </div>

      {/* Sub-Pollutants Matrix */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-full pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
        <div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
            PM2.5
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono">{pm25} µg/m³</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
            PM10
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono">{pm10} µg/m³</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
            NO₂
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono">{no2} µg/m³</span>
        </div>
      </div>
    </div>
  );
}
