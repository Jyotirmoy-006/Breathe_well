/**
 * @file HeroSection.tsx
 * @description Numbered section 01 Air now integrating the interactive skyline, particle simulation, dial, and verdict.
 */

import React from 'react';

import { AqiDial } from './AqiDial';
import { HeroVerdict } from './HeroVerdict';
import { ParticleSimulation } from './ParticleSimulation';
import { SkylineHaze } from './SkylineHaze';
import type { HeroSectionProps } from './types';

/**
 * Section 01 Air now providing comprehensive real-time atmospheric assessment.
 */
export function HeroSection({
  liveMetrics,
  weatherExplainer,
  planMode = 'rule-based',
  planModeReason,
  scrubberPm25,
  className = '',
}: HeroSectionProps): React.JSX.Element {
  const activePm25 = scrubberPm25 ?? liveMetrics.currentPm25;

  return (
    <section aria-labelledby="section-air-now" className={`space-y-6 ${className}`}>
      {/* Numbered Section Header */}
      <div className="flex items-center gap-3 border-b border-stone-300 dark:border-stone-800 pb-3">
        <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] tracking-wider uppercase">
          01
        </span>
        <h2 id="section-air-now" className="text-xl sm:text-2xl font-bold font-serif">
          Air now
        </h2>
        {scrubberPm25 !== null && scrubberPm25 !== undefined && (
          <span className="ml-auto text-xs font-mono bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
            Timeline preview: {scrubberPm25} µg/m³
          </span>
        )}
      </div>

      {/* Skyline with Particle Simulation Overlay */}
      <div className="relative">
        <SkylineHaze pm25={activePm25} />
        <ParticleSimulation pm25={activePm25} />
      </div>

      {/* Grid of Gauge Dial & Plain-Language Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5">
          <AqiDial
            pm25={liveMetrics.currentPm25}
            pm10={liveMetrics.currentPm10}
            no2={liveMetrics.currentNo2}
            aqi={liveMetrics.aqi}
            category={liveMetrics.cpcbCategory}
            whoMultiple={liveMetrics.whoMultiple}
          />
        </div>

        <div className="md:col-span-7">
          <HeroVerdict
            category={liveMetrics.cpcbCategory}
            weatherExplainer={weatherExplainer}
            planMode={planMode}
            planModeReason={planModeReason}
          />
        </div>
      </div>
    </section>
  );
}
