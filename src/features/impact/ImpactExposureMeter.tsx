/**
 * @file ImpactExposureMeter.tsx
 * @description Dynamic live animated gauge visualizing exposure reduction and emissions averted.
 */

import React from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import type { ExposureMeterProps } from './types';

/**
 * Visual impact meter displaying real-time aggregated physiological and ecological benefits.
 */
export function ImpactExposureMeter({
  impact,
  onOpenExplanation,
  className = '',
}: ExposureMeterProps): React.JSX.Element {
  const highReduction = impact.exposureReductionPct.high;
  const lowReduction = impact.exposureReductionPct.low;
  const progressRatio = Math.min(100, Math.round((highReduction / 85) * 100));

  return (
    <div
      role="region"
      aria-label="Simulated Personal Impact Assessment"
      className={`rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 p-5 backdrop-blur-xs space-y-4 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            Simulated Protection
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A5341] dark:text-[#2DD4BF]">
            {lowReduction}% - {highReduction}%
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Estimated reduction in inhaled PM2.5 exposure
          </p>
        </div>
        <Badge variant={impact.actionCount > 0 ? 'Good' : 'neutral'} size="md">
          {impact.actionCount} active action{impact.actionCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Visual Meter Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span>0% baseline</span>
          <span>85% physical ceiling</span>
        </div>
        <div className="h-3 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-600 to-[#1A5341] dark:from-teal-400 dark:to-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${String(progressRatio)}%` }}
          />
        </div>
      </div>

      {/* Carbon Offset Metrics Strip */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
        <div className="p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/50">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">
            Weekly Carbon Averted
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
            {impact.co2eKgPerWeek.high} kg CO₂e
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/50">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">
            Annualized Impact
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
            {impact.co2eKgPerYear.high} kg CO₂e
          </span>
        </div>
      </div>

      {/* How We Estimate This Button */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Confidence: <strong className="capitalize">{impact.confidence}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={onOpenExplanation}>
          🔍 How we estimate this
        </Button>
      </div>
    </div>
  );
}
