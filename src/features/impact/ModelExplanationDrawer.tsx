/**
 * @file ModelExplanationDrawer.tsx
 * @description Slide-over drawer explaining the non-double-counting multiplicative mathematical model.
 */

import React from 'react';

import { ModalDrawer } from '../../components/ui/ModalDrawer';

interface ExplanationDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Explanatory slide-over laying bare the empirical formulas and scientific citations.
 */
export function ModelExplanationDrawer({
  isOpen,
  onClose,
}: ExplanationDrawerProps): React.JSX.Element {
  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="How We Estimate Your Impact"
      description="Transparent mathematical modeling of exposure reduction and emissions offsets."
      mode="drawer"
    >
      <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
        <section className="space-y-1.5">
          <h4 className="font-bold text-stone-900 dark:text-stone-100">
            1. Multiplicative Non-Double-Counting Formula
          </h4>
          <p>
            When combining multiple protective measures (e.g. wearing an N95 mask AND running a HEPA
            filter indoors), their percentage reductions are never added directly. Instead, they
            operate multiplicatively:
          </p>
          <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-xs text-stone-900 dark:text-stone-100">
            R_combined = 1 - ∏(1 - r_i)
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400">
            Example: Two interventions each providing 50% protection result in 1 - (1 - 0.5)(1 -
            0.5) = 75% reduction, not 100%.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-stone-900 dark:text-stone-100">
            2. 85% Physical Exposure Ceiling
          </h4>
          <p>
            Real-world epidemiological studies confirm that imperfect facial mask seals, transient
            doorway infiltration, and inevitable brief outdoor exposure establish an empirical
            protection limit of 85%.
          </p>
        </section>

        <section className="space-y-1.5">
          <h4 className="font-bold text-stone-900 dark:text-stone-100">
            3. Additive Carbon Footprint Reductions
          </h4>
          <p>
            Carbon emissions savings from replacing motor vehicle trips with transit or cycling, and
            swapping biomass heating for electric appliances, are mutually exclusive combustion
            offsets summed additively in kilograms of CO₂ equivalent (kg CO₂e).
          </p>
        </section>

        <section className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-bold text-stone-900 dark:text-stone-100">
            Scientific Sources & Citations
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-stone-600 dark:text-stone-400">
            <li>WHO Global Air Quality Guidelines (2021 update)</li>
            <li>Central Pollution Control Board (CPCB) National Air Quality Index standard</li>
            <li>US EPA Air Quality Criteria for Particulate Matter (EPA/600/P-99/002)</li>
            <li>
              Peer-reviewed building envelope infiltration coefficients for Indian housing stock
            </li>
          </ul>
        </section>
      </div>
    </ModalDrawer>
  );
}
