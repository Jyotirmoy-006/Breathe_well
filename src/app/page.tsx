/**
 * @file page.tsx
 * @description Master home page integrating Atmosphere Journal sections 01 to 05.
 */

'use client';

import React from 'react';

import { JournalFooter } from '../components/layout/JournalFooter';
import { JournalHeader } from '../components/layout/JournalHeader';
import { ThemeProvider } from '../components/theme/ThemeContext';
import { HeroSection } from '../features/hero';
import { ImpactSection } from '../features/impact';
import { useJournalState } from '../features/journal/useJournalState';
import { PlanSection } from '../features/plan';
import { PrintFamilyPlan } from '../features/print';
import { ProfileSection } from '../features/profile';
import { TimelineSection } from '../features/timeline';

function JournalContent(): React.JSX.Element {
  const state = useJournalState();
  const selectedHourly = state.hourly[state.scrubberIndex];
  const scrubberPm25 = selectedHourly ? selectedHourly.pm25 : null;

  return (
    <div className="min-h-screen flex flex-col paper-grain">
      <JournalHeader selectedLocation={state.location} onSelectLocation={state.setLocation} />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-12">
        {/* Section 01: Air now */}
        <HeroSection
          liveMetrics={state.liveMetrics}
          weatherExplainer={state.weatherExplainer}
          planMode="rule-based"
          scrubberPm25={scrubberPm25}
        />

        {/* Section 02: Next 48 hours */}
        <TimelineSection
          hourly={state.hourly}
          windows={state.windows}
          selectedIndex={state.scrubberIndex}
          onSelectIndex={state.setScrubberIndex}
        />

        {/* Section 03: Your household */}
        <ProfileSection profile={state.profile} onProfileChange={state.setProfile} />

        {/* Section 04: Your plan */}
        <PlanSection
          plan={state.plan}
          activeLocale={state.locale}
          onLocaleChange={state.setLocale}
          selectedActionIds={state.selectedActionIds}
          onToggleAction={state.toggleAction}
        />

        {/* Section 05: Your impact */}
        <ImpactSection
          allActions={state.allActions}
          selectedActionIds={state.selectedActionIds}
          onToggleAction={state.toggleAction}
          onSelectAll={state.selectAllActions}
          onDeselectAll={state.deselectAllActions}
        />

        {/* Printable One-Page Cheat-Sheet */}
        <PrintFamilyPlan
          data={{
            locationName: state.location.name,
            aqi: state.liveMetrics.aqi,
            cpcbCategory: state.liveMetrics.cpcbCategory,
            pm25: state.liveMetrics.currentPm25,
            generatedDate: new Date().toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }}
        />
      </main>

      <JournalFooter />
    </div>
  );
}

/**
 * Root home page wrapped with the persistent theme context.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <ThemeProvider>
      <JournalContent />
    </ThemeProvider>
  );
}
