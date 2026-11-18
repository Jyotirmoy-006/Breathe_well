/**
 * @file SkylineHaze.tsx
 * @description Layered SVG city skyline interpolating haze opacity (0.10 to 0.85) and color tint with PM2.5.
 */

import React from 'react';

interface SkylineHazeProps {
  readonly pm25: number;
  readonly className?: string;
}

function calculateHazeProperties(pm25: number): { opacity: number; tint: string } {
  if (pm25 <= 30) {
    return { opacity: 0.1, tint: 'rgba(210, 230, 245, 0.25)' };
  }
  if (pm25 <= 60) {
    return { opacity: 0.22, tint: 'rgba(220, 228, 218, 0.35)' };
  }
  if (pm25 <= 120) {
    return { opacity: 0.42, tint: 'rgba(225, 215, 185, 0.55)' };
  }
  if (pm25 <= 250) {
    return { opacity: 0.68, tint: 'rgba(200, 175, 145, 0.75)' };
  }
  return { opacity: 0.85, tint: 'rgba(170, 140, 120, 0.88)' };
}

/**
 * 4-layer parallax skyline rendering distant ridges, monuments, skyscrapers, and trees.
 */
export function SkylineHaze({ pm25, className = '' }: SkylineHazeProps): React.JSX.Element {
  const { opacity, tint } = calculateHazeProperties(pm25);

  return (
    <div
      className={`relative w-full h-48 sm:h-64 overflow-hidden rounded-2xl border border-stone-300 dark:border-stone-800 bg-linear-to-b from-sky-100 via-amber-50 to-stone-200 dark:from-slate-900 dark:via-stone-900 dark:to-stone-950 transition-colors duration-500 ${className}`}
      aria-label={`City skyline showing visual smog representation for PM2.5 of ${String(pm25)} micrograms per cubic meter`}
    >
      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* Layer 1: Distant Aravali ridge contour */}
        <path
          d="M0,230 Q120,180 280,210 T560,195 T840,215 L1000,200 L1000,300 L0,300 Z"
          className="fill-stone-300/60 dark:fill-stone-800/60 transition-colors"
        />

        {/* Layer 2: Mid-city monuments & landmarks (India Gate arch, Red Fort crenellations) */}
        <path
          d="M0,250 L60,250 L60,210 L80,210 L80,250 L140,250 L140,190 L170,170 L200,190 L200,250 L320,250 L340,180 L360,180 L380,250 L470,250 L470,160 L500,160 L500,250 L650,250 L670,150 L710,150 L730,250 L850,250 L870,175 L910,175 L930,250 L1000,250 L1000,300 L0,300 Z"
          className="fill-stone-400/70 dark:fill-stone-700/70 transition-colors"
        />

        {/* Layer 3: Modern urban high-rises and towers */}
        <path
          d="M30,265 L50,265 L50,220 L75,220 L75,265 L220,265 L220,210 L250,210 L250,265 L410,265 L410,190 L445,190 L445,265 L590,265 L590,200 L620,200 L620,265 L780,265 L780,215 L810,215 L810,265 L1000,265 L1000,300 L0,300 Z"
          className="fill-stone-500/80 dark:fill-stone-600/80 transition-colors"
        />

        {/* Layer 4: Foreground neem trees and street edge */}
        <path
          d="M0,285 Q30,265 60,285 Q90,260 120,285 L350,285 Q380,255 410,285 L700,285 Q730,260 760,285 L1000,285 L1000,300 L0,300 Z"
          className="fill-stone-700 dark:fill-stone-500 transition-colors"
        />
      </svg>

      {/* Atmospheric Haze Interpolation Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          opacity,
          backgroundColor: tint,
          backdropFilter: `blur(${String(opacity * 3.5)}px)`,
        }}
      />
    </div>
  );
}
