/**
 * @file ImpactSection.tsx
 * @description Numbered section 05 Your impact presenting live simulated What-If exposure reduction.
 */

'use client';

import React, { useMemo, useState } from 'react';

import { combineActionImpacts } from '../../domain/impact/model';

import { ImpactActionChecklist } from './ImpactActionChecklist';
import { ImpactExposureMeter } from './ImpactExposureMeter';
import { ModelExplanationDrawer } from './ModelExplanationDrawer';
import type { ImpactSectionProps } from './types';

/**
 * Section 05 Your impact providing interactive personal exposure and emissions modeling.
 */
export function ImpactSection({
  allActions,
  selectedActionIds,
  onToggleAction,
  onSelectAll,
  onDeselectAll,
  className = '',
}: ImpactSectionProps): React.JSX.Element {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const activeActions = useMemo(
    () => allActions.filter((a) => selectedActionIds.has(a.id)),
    [allActions, selectedActionIds],
  );

  const combinedImpact = useMemo(() => combineActionImpacts(activeActions), [activeActions]);

  return (
    <section aria-labelledby="section-your-impact" className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-stone-300 dark:border-stone-800 pb-3">
        <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] tracking-wider uppercase">
          05
        </span>
        <h2 id="section-your-impact" className="text-xl sm:text-2xl font-bold font-serif">
          Your impact
        </h2>
      </div>

      {/* Grid of Live Animated Meter & Interactive Action Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5">
          <ImpactExposureMeter
            impact={combinedImpact}
            onOpenExplanation={() => {
              setIsExplanationOpen(true);
            }}
          />
        </div>

        <div className="md:col-span-7 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 p-5 backdrop-blur-xs">
          <ImpactActionChecklist
            allActions={allActions}
            selectedActionIds={selectedActionIds}
            onToggleAction={onToggleAction}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
          />
        </div>
      </div>

      {/* Mathematical Transparent Model Drawer */}
      <ModelExplanationDrawer
        isOpen={isExplanationOpen}
        onClose={() => {
          setIsExplanationOpen(false);
        }}
      />
    </section>
  );
}
