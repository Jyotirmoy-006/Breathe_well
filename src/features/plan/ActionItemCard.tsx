/**
 * @file ActionItemCard.tsx
 * @description Accessible expandable card detailing an intervention's rationale and evidence.
 */

'use client';

import React, { useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { PLAN_TRANSLATIONS } from './translations';
import type { ActionCardProps } from './types';

const EFFORT_LABELS: Record<number, string> = {
  1: 'Low Effort',
  2: 'Med Effort',
  3: 'High Effort',
};
const COST_LABELS: Record<string, string> = {
  free: 'Free',
  low: 'Low Cost',
  medium: 'Med Cost',
  high: 'High Cost',
};

/**
 * Expandable card revealing scientific rationale, cost, and emissions savings.
 */
export function ActionItemCard({
  item,
  isSelected,
  onToggle,
  locale,
  className = '',
}: ActionCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const { action, rationale } = item;
  const strings = PLAN_TRANSLATIONS[locale];

  return (
    <div
      className={`rounded-xl border transition-all p-4 ${
        isSelected
          ? 'border-[#1A5341] bg-white dark:border-[#2DD4BF] dark:bg-stone-900 shadow-xs'
          : 'border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            id={`action-check-${action.id}`}
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              onToggle(action.id);
            }}
            className="mt-1 h-5 w-5 rounded border-stone-300 text-[#1A5341] accent-[#1A5341] dark:accent-[#2DD4BF] cursor-pointer"
          />
          <label htmlFor={`action-check-${action.id}`} className="cursor-pointer">
            <span className="block text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
              {action.title}
            </span>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">{action.description}</p>
          </label>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsExpanded((prev) => !prev);
          }}
          aria-expanded={isExpanded}
          aria-label={`Toggle details for ${action.title}`}
        >
          {isExpanded ? '▲' : '▼'}
        </Button>
      </div>

      {/* Badges Strip */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
        <Badge variant="accent" size="sm">
          {action.coefficients.pm25ExposureReductionPct.high}% lower PM2.5
        </Badge>
        {action.coefficients.co2eKgPerWeek.high > 0 && (
          <Badge variant="Good" size="sm">
            {action.coefficients.co2eKgPerWeek.high} kg CO₂e/wk
          </Badge>
        )}
        <Badge variant="neutral" size="sm">
          {COST_LABELS[action.cost] ?? action.cost}
        </Badge>
        <Badge variant="neutral" size="sm">
          {EFFORT_LABELS[action.effort] ?? `Effort ${String(action.effort)}`}
        </Badge>
      </div>

      {/* Expandable Explanation Details */}
      {isExpanded && (
        <div className="mt-3 space-y-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 p-3 text-xs border border-stone-200 dark:border-stone-800">
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              {strings.whyThisMatters}:
            </span>
            <p className="text-stone-700 dark:text-stone-300 mt-0.5">{rationale}</p>
          </div>
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              {strings.evidenceSource} ({action.coefficients.confidence}):
            </span>
            <p className="text-stone-600 dark:text-stone-400 mt-0.5">{action.evidenceNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
