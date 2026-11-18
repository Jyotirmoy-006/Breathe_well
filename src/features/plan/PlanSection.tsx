/**
 * @file PlanSection.tsx
 * @description Numbered section 04 Your plan orchestrating 4-tab actionable lifestyle guidance.
 */

'use client';

import React, { useState } from 'react';

import { Tabs } from '../../components/ui/Tabs';
import type { TabItem } from '../../components/ui/Tabs';

import { CommunityTab } from './CommunityTab';
import { HomeAirTab } from './HomeAirTab';
import { MedicalCautionBanner } from './MedicalCautionBanner';
import { PlanLanguageSelector } from './PlanLanguageSelector';
import { RoutineTab } from './RoutineTab';
import { SwapsTab } from './SwapsTab';
import { PLAN_TRANSLATIONS } from './translations';
import type { PlanSectionProps, PlanTabId } from './types';

function renderActiveTabContent(activeTab: PlanTabId, props: PlanSectionProps): React.JSX.Element {
  const { plan, selectedActionIds, onToggleAction, activeLocale } = props;

  if (activeTab === 'home') {
    return (
      <HomeAirTab
        group={plan.homeAir}
        selectedActionIds={selectedActionIds}
        onToggleAction={onToggleAction}
        locale={activeLocale}
      />
    );
  }
  if (activeTab === 'swaps') {
    return (
      <SwapsTab
        group={plan.swaps}
        selectedActionIds={selectedActionIds}
        onToggleAction={onToggleAction}
        locale={activeLocale}
      />
    );
  }
  if (activeTab === 'community') {
    return (
      <CommunityTab
        group={plan.community}
        selectedActionIds={selectedActionIds}
        onToggleAction={onToggleAction}
        locale={activeLocale}
      />
    );
  }
  return (
    <RoutineTab
      timeBlocks={plan.routine.timeBlocks}
      selectedActionIds={selectedActionIds}
      onToggleAction={onToggleAction}
      locale={activeLocale}
    />
  );
}

/**
 * Section 04 Your plan rendering interactive schedule, domestic air hacks, swaps, and community steps.
 */
export function PlanSection(props: PlanSectionProps): React.JSX.Element {
  const { plan, activeLocale, onLocaleChange, className = '' } = props;
  const [activeTab, setActiveTab] = useState<PlanTabId>('routine');
  const strings = PLAN_TRANSLATIONS[activeLocale];
  const isSevere = plan.aqiCategory === 'Severe' || plan.aqiCategory === 'Very Poor';

  const tabItems: readonly TabItem<PlanTabId>[] = [
    { id: 'routine', label: strings.tabs.routine, count: plan.routine.totalActions },
    { id: 'home', label: strings.tabs.home, count: plan.homeAir.actions.length },
    { id: 'swaps', label: strings.tabs.swaps, count: plan.swaps.actions.length },
    { id: 'community', label: strings.tabs.community, count: plan.community.actions.length },
  ];

  return (
    <section
      aria-labelledby="section-your-plan"
      lang={activeLocale}
      className={`space-y-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] tracking-wider uppercase">
            04
          </span>
          <h2 id="section-your-plan" className="text-xl sm:text-2xl font-bold font-serif">
            {strings.title}
          </h2>
        </div>
        <PlanLanguageSelector activeLocale={activeLocale} onChangeLocale={onLocaleChange} />
      </div>

      {isSevere && <MedicalCautionBanner locale={activeLocale} />}

      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
        }}
        ariaLabel="Action Plan Categories"
      />

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {renderActiveTabContent(activeTab, props)}
      </div>
    </section>
  );
}
