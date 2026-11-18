/**
 * @file Button.tsx
 * @description Accessible button component satisfying WCAG 2.2 touch target & focus standards.
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: React.ReactNode;
  readonly children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1A5341] text-[#F4EFE6] hover:bg-[#143F32] dark:bg-[#2DD4BF] dark:text-[#121418] dark:hover:bg-[#26bba8] shadow-sm',
  secondary:
    'bg-stone-200 text-stone-900 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
  outline:
    'border border-stone-400 bg-transparent text-inherit hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800',
  ghost: 'bg-transparent text-inherit hover:bg-stone-200/60 dark:hover:bg-stone-800/60',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm',
  lg: 'min-h-[48px] min-w-[48px] px-5 py-2.5 text-base',
};

/**
 * Universal interactive button with accessible focus rings and touch targets.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, children, className = '', disabled, ...props },
  ref,
) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-transform duration-75 active:scale-[0.98] cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] focus-visible:ring-offset-2 dark:focus-visible:ring-[#2DD4BF]';

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${baseClasses} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});
