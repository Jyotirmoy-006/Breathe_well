/**
 * @file SuggestedQuestions.tsx
 * @description Accessible suggested questions chips for quick inquiry into air quality plans.
 */

'use client';

import React from 'react';

/** Predefined grounded prompt suggestions for quick selection. */
export const SUGGESTED_QUESTIONS: readonly string[] = [
  'Is it safe for my child to play outdoors today?',
  'How do I maintain my DIY air filter?',
  'When is the best time to ventilate my home?',
  'What mask should I wear during peak commute?',
];

/** Properties for the SuggestedQuestions component. */
export interface SuggestedQuestionsProps {
  readonly onSelect: (question: string) => void;
  readonly disabled?: boolean | undefined;
}

/**
 * Renders a row of accessible suggested question chips.
 */
export function SuggestedQuestions(props: SuggestedQuestionsProps): React.JSX.Element {
  const { onSelect, disabled = false } = props;

  return (
    <div className="space-y-1.5" role="group" aria-label="Suggested Questions">
      <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
        Suggested inquiries:
      </span>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelect(q);
            }}
            className="text-xs px-2.5 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 hover:border-stone-400 dark:hover:border-stone-600 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1A5341] dark:focus:ring-[#2DD4BF]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
