/**
 * @file MedicalCautionBanner.tsx
 * @description Severe smog emergency medical advisory banner for vulnerable populations.
 */

import React from 'react';

import { PLAN_TRANSLATIONS } from './translations';
import type { PlanLocale } from './types';

interface MedicalCautionProps {
  readonly locale: PlanLocale;
  readonly className?: string | undefined;
}

/**
 * High-visibility clinical warning displayed when air conditions reach hazardous thresholds.
 */
export function MedicalCautionBanner({
  locale,
  className = '',
}: MedicalCautionProps): React.JSX.Element {
  const text = PLAN_TRANSLATIONS[locale].medicalWarning;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-4 text-rose-950 dark:text-rose-200 ${className}`}
    >
      <span aria-hidden="true" className="text-xl">
        🚨
      </span>
      <div className="text-xs sm:text-sm">
        <strong className="block font-bold">Medical Alert:</strong>
        <p className="mt-0.5">{text}</p>
      </div>
    </div>
  );
}
