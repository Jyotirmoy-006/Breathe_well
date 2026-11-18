/**
 * @file axe.test.tsx
 * @description Automated accessibility audits using axe-core across major SaafSaans components.
 * Audits HeroSection (Good, Moderate, Severe), TimelineSection, ProfileSection,
 * PlanSection (all 4 tabs), ImpactSection, and Light/Night themes for zero a11y violations.
 */

import { fireEvent, render } from '@testing-library/react';
import axe from 'axe-core';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getAllActions } from '@/domain/catalog/actions';
import { generatePlan } from '@/domain/planner/engine';
import { PROFILE_PRESETS } from '@/domain/profile/presets';
import { createPm25UgM3 } from '@/domain/types';
import { HeroSection } from '@/features/hero/HeroSection';
import type { LiveAirMetrics } from '@/features/hero/types';
import { ImpactSection } from '@/features/impact/ImpactSection';
import {
  BASELINE_LIVE_METRICS,
  computeBaselineWindows,
  generateBaselineHourly,
} from '@/features/journal/journalBaseline';
import { PlanSection } from '@/features/plan/PlanSection';
import type { PlanTabId } from '@/features/plan/types';
import { ProfileSection } from '@/features/profile/ProfileSection';
import { TimelineSection } from '@/features/timeline/TimelineSection';

async function checkA11y(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false }, // jsdom does not support visual styling / computed bounding boxes
    },
  });
  expect(results.violations).toEqual([]);
}

function createMetricsForTier(
  category: 'Good' | 'Moderate' | 'Severe',
  pm25: number,
  aqi: number,
): LiveAirMetrics {
  return {
    ...BASELINE_LIVE_METRICS,
    cpcbCategory: category,
    currentPm25: pm25,
    aqi,
  };
}

describe('Accessibility Audits (axe-core)', () => {
  const baseProfile = PROFILE_PRESETS[0]!.profile;
  const severePlan = generatePlan(baseProfile, createPm25UgM3(350));
  const baselineHourly = generateBaselineHourly();
  const baselineWindows = computeBaselineWindows(baselineHourly);
  const allActions = getAllActions();

  describe('HeroSection across AQI tiers', () => {
    it('passes axe audit in Good tier', async () => {
      const metrics = createMetricsForTier('Good', 20, 35);
      const { container } = render(<HeroSection liveMetrics={metrics} />);
      await checkA11y(container);
    });

    it('passes axe audit in Moderate tier', async () => {
      const metrics = createMetricsForTier('Moderate', 75, 130);
      const { container } = render(<HeroSection liveMetrics={metrics} />);
      await checkA11y(container);
    });

    it('passes axe audit in Severe tier', async () => {
      const metrics = createMetricsForTier('Severe', 360, 440);
      const { container } = render(<HeroSection liveMetrics={metrics} />);
      await checkA11y(container);
    });
  });

  describe('TimelineSection', () => {
    it('passes axe audit in SVG chart view', async () => {
      const { container } = render(
        <TimelineSection
          hourly={baselineHourly}
          windows={baselineWindows}
          selectedIndex={0}
          onSelectIndex={vi.fn()}
        />,
      );
      await checkA11y(container);
    });

    it('passes axe audit in accessible Table view', async () => {
      const { container, getByRole } = render(
        <TimelineSection
          hourly={baselineHourly}
          windows={baselineWindows}
          selectedIndex={0}
          onSelectIndex={vi.fn()}
        />,
      );
      const toggle = getByRole('button', { name: /view as table/i });
      fireEvent.click(toggle);
      await checkA11y(container);
    });
  });

  describe('ProfileSection', () => {
    it('passes axe audit with presets and form controls', async () => {
      const { container } = render(
        <ProfileSection profile={baseProfile} onProfileChange={vi.fn()} />,
      );
      await checkA11y(container);
    });
  });

  describe('PlanSection across all 4 tabs', () => {
    function PlanSectionHarness({ initialTab }: { initialTab: PlanTabId }) {
      const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
        new Set(['routine-n95-commute']),
      );
      return (
        <PlanSection
          plan={severePlan}
          activeLocale="en"
          onLocaleChange={vi.fn()}
          selectedActionIds={selectedIds}
          onToggleAction={(id) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
        />
      );
    }

    it('passes axe audit on Routine tab', async () => {
      const { container } = render(<PlanSectionHarness initialTab="routine" />);
      await checkA11y(container);
    });

    it('passes axe audit on Home air tab', async () => {
      const { container, getByRole } = render(<PlanSectionHarness initialTab="routine" />);
      fireEvent.click(getByRole('tab', { name: /home air/i }));
      await checkA11y(container);
    });

    it('passes axe audit on Swaps tab', async () => {
      const { container, getByRole } = render(<PlanSectionHarness initialTab="routine" />);
      fireEvent.click(getByRole('tab', { name: /swaps/i }));
      await checkA11y(container);
    });

    it('passes axe audit on Community tab', async () => {
      const { container, getByRole } = render(<PlanSectionHarness initialTab="routine" />);
      fireEvent.click(getByRole('tab', { name: /community/i }));
      await checkA11y(container);
    });
  });

  describe('WhatIf ImpactSection', () => {
    it('passes axe audit with active checklist items', async () => {
      const selected = new Set(['routine-n95-commute', 'home-wet-mop']);
      const { container } = render(
        <ImpactSection
          allActions={allActions}
          selectedActionIds={selected}
          onToggleAction={vi.fn()}
          onSelectAll={vi.fn()}
          onDeselectAll={vi.fn()}
        />,
      );
      await checkA11y(container);
    });
  });

  describe('Theme Accessibility (Light and Night)', () => {
    it('passes axe audit in Light paper theme wrapper', async () => {
      const { container } = render(
        <div data-theme="paper" className="paper-grain bg-stone-100 text-stone-900">
          <HeroSection liveMetrics={BASELINE_LIVE_METRICS} />
        </div>,
      );
      await checkA11y(container);
    });

    it('passes axe audit in Night theme wrapper', async () => {
      const { container } = render(
        <div data-theme="night" className="dark bg-stone-950 text-stone-100">
          <HeroSection liveMetrics={BASELINE_LIVE_METRICS} />
        </div>,
      );
      await checkA11y(container);
    });
  });
});
