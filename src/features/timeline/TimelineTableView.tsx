/**
 * @file TimelineTableView.tsx
 * @description Accessible tabular presentation of 48-hour forecast points for screen readers.
 */

import React from 'react';

import { Badge } from '../../components/ui/Badge';

import type { TimelineHour } from './types';

interface TableViewProps {
  readonly hourly: readonly TimelineHour[];
  readonly selectedIndex: number;
  readonly onSelectIndex: (idx: number) => void;
}

function formatRowTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/**
 * Accessible tabular view of forecast points with row selection capability.
 */
export function TimelineTableView({
  hourly,
  selectedIndex,
  onSelectIndex,
}: TableViewProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto max-h-80 rounded-xl border border-stone-300 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
      <table className="w-full text-left text-xs sm:text-sm">
        <caption className="sr-only">48-Hour Hourly Air Quality Forecast Data</caption>
        <thead className="sticky top-0 bg-stone-100 dark:bg-stone-800 border-b border-stone-300 dark:border-stone-700">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              Time
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              PM2.5 (µg/m³)
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              CPCB AQI
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Category
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
          {hourly.map((point, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <tr
                key={point.hourIso}
                className={
                  isSelected
                    ? 'bg-[#1A5341]/10 dark:bg-[#2DD4BF]/20 font-medium'
                    : 'hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
                }
              >
                <td className="px-3 py-2 font-mono">{formatRowTime(point.hourIso)}</td>
                <td className="px-3 py-2 font-mono">{point.pm25}</td>
                <td className="px-3 py-2 font-mono">{point.cpcbSubIndex}</td>
                <td className="px-3 py-2">
                  <Badge variant={point.cpcbCategory} size="sm">
                    {point.cpcbCategory}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectIndex(idx);
                    }}
                    className="min-h-[32px] px-2 py-1 rounded text-xs underline text-[#1A5341] dark:text-[#2DD4BF] cursor-pointer"
                  >
                    Select
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
