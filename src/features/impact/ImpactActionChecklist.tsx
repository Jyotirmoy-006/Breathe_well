/**
 * @file ImpactActionChecklist.tsx
 * @description Interactive checklist enabling real-time toggling of interventions for What-If simulation.
 */

import React from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { ActionCatalogEntry } from '../../domain/catalog/types';

interface ChecklistProps {
  readonly allActions: readonly ActionCatalogEntry[];
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (id: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
}

/**
 * Interactive checklist component for exploring combinational health outcomes.
 */
export function ImpactActionChecklist({
  allActions,
  selectedActionIds,
  onToggleAction,
  onSelectAll,
  onDeselectAll,
}: ChecklistProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
          Toggle actions to simulate personal impact:
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            Select all
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            Reset
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {allActions.map((action) => {
          const isChecked = selectedActionIds.has(action.id);
          const checkboxId = `whatif-check-${action.id}`;

          return (
            <div
              key={action.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-colors ${
                isChecked
                  ? 'border-[#1A5341]/40 bg-[#1A5341]/5 dark:border-[#2DD4BF]/40 dark:bg-[#2DD4BF]/10'
                  : 'border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    onToggleAction(action.id);
                  }}
                  className="h-4 w-4 rounded border-stone-300 text-[#1A5341] accent-[#1A5341] dark:accent-[#2DD4BF] cursor-pointer"
                />
                <label
                  htmlFor={checkboxId}
                  className="text-xs sm:text-sm font-medium cursor-pointer"
                >
                  {action.title}
                </label>
              </div>

              <Badge variant="accent" size="sm">
                -{action.coefficients.pm25ExposureReductionPct.high}% PM2.5
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
