/**
 * @file TimelineSection.tsx
 * @description Numbered section 02 Next 48 hours displaying hourly forecast chart, windows, and scrubber.
 */

'use client';

import React, { useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { TimelineScrubber } from './TimelineScrubber';
import { TimelineSvgChart } from './TimelineSvgChart';
import { TimelineTableView } from './TimelineTableView';
import type { TimelineSectionProps } from './types';

/**
 * Section 02 Next 48 hours analyzing diurnal trends and outdoor activity windows.
 */
export function TimelineSection({
  hourly,
  windows,
  selectedIndex,
  onSelectIndex,
  className = '',
}: TimelineSectionProps): React.JSX.Element {
  const [showTable, setShowTable] = useState(false);

  return (
    <section aria-labelledby="section-next-48-hours" className={`space-y-5 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] tracking-wider uppercase">
            02
          </span>
          <h2 id="section-next-48-hours" className="text-xl sm:text-2xl font-bold font-serif">
            Next 48 hours
          </h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowTable((prev) => !prev);
          }}
          aria-expanded={showTable}
        >
          {showTable ? '📊 View chart' : '📋 View as table'}
        </Button>
      </div>

      {/* Highlighted Window Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40">
          <Badge variant="Good" size="sm">
            Best window to go out
          </Badge>
          <div className="text-xs">
            <span className="font-bold text-emerald-950 dark:text-emerald-200">
              {windows.bestWindow.startHour} - {windows.bestWindow.endHour}
            </span>
            <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
              Avg {windows.bestWindow.averagePm25} µg/m³. {windows.bestWindow.recommendation}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40">
          <Badge variant="Very Poor" size="sm">
            Avoid outdoor exposure
          </Badge>
          <div className="text-xs">
            <span className="font-bold text-rose-950 dark:text-rose-200">
              {windows.avoidWindow.startHour} - {windows.avoidWindow.endHour}
            </span>
            <p className="text-rose-800 dark:text-rose-300 mt-0.5">
              Avg {windows.avoidWindow.averagePm25} µg/m³. {windows.avoidWindow.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Main Visual or Tabular Representation */}
      {showTable ? (
        <TimelineTableView
          hourly={hourly}
          selectedIndex={selectedIndex}
          onSelectIndex={onSelectIndex}
        />
      ) : (
        <TimelineSvgChart
          hourly={hourly}
          windows={windows}
          selectedIndex={selectedIndex}
          onSelectIndex={onSelectIndex}
        />
      )}

      {/* Draggable & Keyboard Scrubber */}
      <TimelineScrubber
        hourly={hourly}
        selectedIndex={selectedIndex}
        onSelectIndex={onSelectIndex}
      />
    </section>
  );
}
