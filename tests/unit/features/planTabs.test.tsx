/**
 * @file planTabs.test.tsx
 * @description Unit tests for PlanSection tab switching, routine time-blocks, and language toggles.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { generatePlan } from '../../../src/domain/planner/engine';
import { PROFILE_PRESETS } from '../../../src/domain/profile/presets';
import { createPm25UgM3 } from '../../../src/domain/types';
import { PlanSection } from '../../../src/features/plan/PlanSection';

describe('PlanSection', () => {
  const testProfile = PROFILE_PRESETS[0]?.profile ?? {
    householdSize: 4,
    children: true,
    elderly: false,
    sensitiveGroup: true,
    homeType: 'apartment',
    commuteMode: 'car_ac',
    cookingFuel: 'lpg_induction',
    heatingMethod: 'electric_heater',
    hasAirPurifier: false,
    budget: 'flexible',
  };
  const testPlan = generatePlan(testProfile, createPm25UgM3(320));

  it('renders section 04 and default Routine tab with time blocks', () => {
    render(
      <PlanSection
        plan={testPlan}
        activeLocale="en"
        onLocaleChange={vi.fn()}
        selectedActionIds={new Set(['routine-n95-commute'])}
        onToggleAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /your personalized air protection plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /routine/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/morning/i)).toBeInTheDocument();
  });

  it('switches between Home air, Swaps, and Community tabs', () => {
    render(
      <PlanSection
        plan={testPlan}
        activeLocale="en"
        onLocaleChange={vi.fn()}
        selectedActionIds={new Set()}
        onToggleAction={vi.fn()}
      />,
    );

    const homeTab = screen.getByRole('tab', { name: /home air/i });
    fireEvent.click(homeTab);
    expect(homeTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/ranked domestic interventions/i)).toBeInTheDocument();

    const swapsTab = screen.getByRole('tab', { name: /swaps/i });
    fireEvent.click(swapsTab);
    expect(swapsTab).toHaveAttribute('aria-selected', 'true');

    const communityTab = screen.getByRole('tab', { name: /community/i });
    fireEvent.click(communityTab);
    expect(communityTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/institutional initiatives/i)).toBeInTheDocument();
  });

  it('switches plan language to Hindi (हिन्दी) and updates content & lang attribute', () => {
    const handleLocaleChange = vi.fn();
    const { rerender } = render(
      <PlanSection
        plan={testPlan}
        activeLocale="en"
        onLocaleChange={handleLocaleChange}
        selectedActionIds={new Set()}
        onToggleAction={vi.fn()}
      />,
    );

    const hindiBtn = screen.getByRole('radio', { name: /हिन्दी/i });
    fireEvent.click(hindiBtn);
    expect(handleLocaleChange).toHaveBeenCalledWith('hi');

    rerender(
      <PlanSection
        plan={testPlan}
        activeLocale="hi"
        onLocaleChange={handleLocaleChange}
        selectedActionIds={new Set()}
        onToggleAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /आपकी व्यक्तिगत वायु सुरक्षा योजना/i }),
    ).toBeInTheDocument();
  });

  it('displays severe medical alert banner when air tier is Severe / Very Poor', () => {
    render(
      <PlanSection
        plan={testPlan}
        activeLocale="en"
        onLocaleChange={vi.fn()}
        selectedActionIds={new Set()}
        onToggleAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/breathing difficulty or chest discomfort/i)).toBeInTheDocument();
  });

  it('expands action item card to reveal rationale and toggles selection', () => {
    const handleToggle = vi.fn();
    render(
      <PlanSection
        plan={testPlan}
        activeLocale="en"
        onLocaleChange={vi.fn()}
        selectedActionIds={new Set(['routine-n95-commute'])}
        onToggleAction={handleToggle}
      />,
    );

    const toggleBtn = screen.getAllByRole('button', { name: /toggle details for/i })[0]!;
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/why this matters/i)).toBeInTheDocument();

    const checkbox = screen.getAllByRole('checkbox')[0]!;
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalled();
  });
});
