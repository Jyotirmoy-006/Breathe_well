/**
 * @file TimelineSvgChart.tsx
 * @description Hand-crafted accessible SVG area chart for 48-hour PM2.5 concentration with window bands.
 */

import React from 'react';

import type { TimelineWindows } from '../../domain/planner/types';

import type { TimelineHour } from './types';

interface SvgChartProps {
  readonly hourly: readonly TimelineHour[];
  readonly windows: TimelineWindows;
  readonly selectedIndex: number;
  readonly onSelectIndex: (idx: number) => void;
}

function buildPathString(
  hourly: readonly TimelineHour[],
  maxPm25: number,
): { line: string; area: string } {
  if (hourly.length === 0) return { line: '', area: '' };
  const count = hourly.length;

  const points = hourly.map((h, i) => {
    const x = (i / (count - 1)) * 800;
    const y = 180 - (h.pm25 / maxPm25) * 150;
    return `${String(x)},${String(y)}`;
  });

  const line = `M${points.join(' L')}`;
  const area = `${line} L800,190 L0,190 Z`;
  return { line, area };
}

function computeWindowRect(
  startIdx: number,
  endIdx: number,
  total: number,
): { x: number; width: number } {
  const x = (startIdx / Math.max(1, total - 1)) * 800;
  const width = Math.max(20, ((endIdx - startIdx + 1) / Math.max(1, total - 1)) * 800);
  return { x, width };
}

/**
 * Custom SVG area chart plotting hourly pollutant concentrations without external dependencies.
 */
export function TimelineSvgChart({
  hourly,
  windows,
  selectedIndex,
  onSelectIndex,
}: SvgChartProps): React.JSX.Element {
  const maxPm25 = Math.max(100, ...hourly.map((h) => h.pm25));
  const { line, area } = buildPathString(hourly, maxPm25);
  const bestRect = computeWindowRect(
    windows.bestWindow.startIndex,
    windows.bestWindow.endIndex,
    hourly.length,
  );
  const avoidRect = computeWindowRect(
    windows.avoidWindow.startIndex,
    windows.avoidWindow.endIndex,
    hourly.length,
  );
  const scrubberX = (selectedIndex / Math.max(1, hourly.length - 1)) * 800;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-stone-300 bg-white/70 p-3 backdrop-blur-xs dark:border-stone-800 dark:bg-stone-900/70">
      <svg
        viewBox="0 0 800 200"
        className="w-full h-44 sm:h-52 cursor-pointer select-none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const width = rect.width > 0 ? rect.width : 800;
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
          const idx = Math.round(ratio * (hourly.length - 1));
          onSelectIndex(idx);
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="timeline-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A5341" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1A5341" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Highlight Band: Best Window (Green) */}
        <rect
          x={bestRect.x}
          y="10"
          width={bestRect.width}
          height="180"
          className="fill-emerald-500/15 dark:fill-emerald-400/20"
        />

        {/* Highlight Band: Avoid Window (Red) */}
        <rect
          x={avoidRect.x}
          y="10"
          width={avoidRect.width}
          height="180"
          className="fill-rose-500/15 dark:fill-rose-400/20"
        />

        {/* Area fill & Stroke line */}
        <path d={area} fill="url(#timeline-area-gradient)" />
        <path
          d={line}
          fill="none"
          stroke="#1A5341"
          strokeWidth="2.5"
          className="dark:stroke-[#2DD4BF]"
        />

        {/* Scrubber vertical marker */}
        <line
          x1={scrubberX}
          y1="10"
          x2={scrubberX}
          y2="190"
          stroke="#D97706"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <circle cx={scrubberX} cy="185" r="4.5" fill="#D97706" />
      </svg>
    </div>
  );
}
