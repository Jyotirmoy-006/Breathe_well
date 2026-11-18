/**
 * @file HeroVerdict.tsx
 * @description Plain-language verdict banner, honest attribution callout, and AI/rule plan status pill.
 */

import React from 'react';

import { Badge } from '@/components/ui/Badge';
import { getAqiCategoryVerdict, getAqiHealthRecommendation } from '@/domain/aqi/category';
import type { AqiCategory } from '@/domain/aqi/constants';
import type { WeatherExplainer } from '@/server/providers/openMeteoForecast';

export interface HeroVerdictProps {
  readonly category: AqiCategory;
  readonly weatherExplainer?: WeatherExplainer | null | undefined;
  readonly planMode?: 'ai' | 'rule-based' | undefined;
  readonly planModeReason?: string | undefined;
  readonly className?: string | undefined;
}

/**
 * Health verdict and meteorological cause explainer banner for the hero section.
 */
export function HeroVerdict({
  category,
  weatherExplainer,
  planMode = 'rule-based',
  planModeReason,
  className = '',
}: HeroVerdictProps): React.JSX.Element {
  const verdict = getAqiCategoryVerdict(category);
  const recommendation = getAqiHealthRecommendation(category);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Plan Status Pill */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={planMode === 'ai' ? 'accent' : 'neutral'}
          icon={planMode === 'ai' ? '✨' : '⚙️'}
        >
          {planMode === 'ai' ? 'AI-personalized plan' : 'Rule-based plan'}
        </Badge>
        {planModeReason && (
          <span className="text-xs text-stone-500 dark:text-stone-400">({planModeReason})</span>
        )}
      </div>

      {/* Primary Plain-Language Verdict */}
      <div className="rounded-xl border border-stone-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-4 sm:p-5 backdrop-blur-xs">
        <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
          {verdict}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          {recommendation}
        </p>

        {weatherExplainer && (
          <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              Why is it bad today?{' '}
            </span>
            <span>{weatherExplainer.summary}</span>
          </div>
        )}
      </div>

      {/* Honest Attribution Callout */}
      <div className="flex items-start gap-2 text-xs text-stone-500 dark:text-stone-400">
        <span aria-hidden="true" className="text-sm">
          ℹ️
        </span>
        <p>
          Modelled estimate by{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-stone-800 dark:hover:text-stone-200"
          >
            Open-Meteo
          </a>
          . Cross-verify with{' '}
          <a
            href="https://app.cpcbccr.com/AQI_India/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-stone-800 dark:hover:text-stone-200"
          >
            CPCB / SAFAR
          </a>{' '}
          ground stations.
        </p>
      </div>
    </div>
  );
}
