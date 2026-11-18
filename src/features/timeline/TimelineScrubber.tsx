/**
 * @file TimelineScrubber.tsx
 * @description Accessible keyboard and drag scrubber for inspecting 48 hourly forecast points.
 */

import React from 'react';

import { Badge } from '../../components/ui/Badge';
import { KeyboardShortcutHint } from '../../components/ui/KeyboardShortcutHint';

import type { TimelineHour } from './types';

interface TimelineScrubberProps {
  readonly hourly: readonly TimelineHour[];
  readonly selectedIndex: number;
  readonly onSelectIndex: (idx: number) => void;
  readonly className?: string;
}

function formatHourLabel(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoString;
  }
}

/**
 * Accessible scrubber allowing fine-grained examination of forecast points.
 */
export function TimelineScrubber({
  hourly,
  selectedIndex,
  onSelectIndex,
  className = '',
}: TimelineScrubberProps): React.JSX.Element {
  const current = hourly[selectedIndex] ?? hourly[0];
  const count = hourly.length;
  const hourLabel = current ? formatHourLabel(current.hourIso) : '';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Scrubber Value Readout */}
      {current && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{hourLabel}</span>
            <Badge variant={current.cpcbCategory} size="sm">
              {current.cpcbCategory} ({current.cpcbSubIndex} AQI)
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#1A5341] dark:text-[#2DD4BF]">
              {current.pm25} µg/m³ PM2.5
            </span>
            <KeyboardShortcutHint shortcut="← / →" />
          </div>
        </div>
      )}

      {/* Accessible Slider Scrubber */}
      <div className="flex items-center gap-3">
        <label htmlFor="timeline-scrubber-slider" className="sr-only">
          48-Hour Forecast Timeline Scrubber
        </label>
        <input
          id="timeline-scrubber-slider"
          type="range"
          min={0}
          max={Math.max(0, count - 1)}
          value={selectedIndex}
          onChange={(e) => {
            onSelectIndex(Number(e.target.value));
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              onSelectIndex(Math.max(0, selectedIndex - 1));
            } else if (e.key === 'ArrowRight') {
              onSelectIndex(Math.min(count - 1, selectedIndex + 1));
            }
          }}
          className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#1A5341] dark:accent-[#2DD4BF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341]"
          aria-valuetext={`${hourLabel}, PM2.5 ${String(current?.pm25 ?? 0)}`}
        />
      </div>
    </div>
  );
}
