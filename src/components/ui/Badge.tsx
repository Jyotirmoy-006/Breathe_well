/**
 * @file Badge.tsx
 * @description Accessible CPCB air quality and metadata badge component.
 */

import React from 'react';

import type { AqiCategory } from '@/domain/aqi/constants';

export type BadgeVariant = AqiCategory | 'neutral' | 'accent' | 'outline';

export interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly icon?: React.ReactNode;
  readonly size?: 'sm' | 'md';
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  Good: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  Satisfactory:
    'bg-lime-100 text-lime-900 border-lime-300 dark:bg-lime-950 dark:text-lime-200 dark:border-lime-800',
  Moderate:
    'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  Poor: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800',
  'Very Poor':
    'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
  Severe:
    'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800',
  neutral:
    'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700',
  accent:
    'bg-teal-100 text-teal-950 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800',
  outline:
    'bg-transparent text-stone-700 border-stone-300 dark:text-stone-300 dark:border-stone-700',
};

/**
 * Visual badge displaying CPCB categories and status tags with high-contrast borders.
 */
export function Badge({
  variant = 'neutral',
  children,
  className = '',
  icon,
  size = 'md',
}: BadgeProps): React.JSX.Element {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';
  const variantClass = BADGE_STYLES[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${variantClass} ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
