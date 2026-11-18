/**
 * @file PrintFamilyPlan.tsx
 * @description High-contrast 1-page printable emergency cheat-sheet with emergency contact blank lines.
 */

'use client';

import React from 'react';

import { Button } from '../../components/ui/Button';

import type { PrintFamilyPlanProps } from './types';

function handlePrint(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Printable 1-page family emergency air defense cheat-sheet for home display.
 */
export function PrintFamilyPlan({ data, className = '' }: PrintFamilyPlanProps): React.JSX.Element {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Screen trigger bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-serif">
            One-Page Family Air Plan (Printable Cheat-Sheet)
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Keep an emergency one-page physical guide on your refrigerator door or community
            noticeboard.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handlePrint} className="print-include">
          🖨️ Print Family Plan
        </Button>
      </div>

      {/* Printable Sheet (visible on print, hidden or styled cleanly on screen) */}
      <div className="print-only hidden print:block p-6 border-2 border-black bg-white text-black text-xs font-sans space-y-4 page-break-avoid">
        {/* Header */}
        <div className="border-b-2 border-black pb-2 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold font-serif tracking-tight">
              SaafSaans (साफ़ साँस) — Family Air Plan
            </h1>
            <p className="text-[11px] font-mono">
              Location: <strong>{data.locationName}</strong> | AQI: <strong>{data.aqi}</strong> (
              {data.cpcbCategory}) | PM2.5: <strong>{data.pm25} µg/m³</strong>
            </p>
          </div>
          <span className="text-[10px] font-mono">{data.generatedDate}</span>
        </div>

        {/* Daily Schedule */}
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
            1. Daily Exposure Routine
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <strong>Morning (06:00-09:00):</strong> Keep windows sealed; avoid morning
              jogs/outdoor yoga.
            </div>
            <div>
              <strong>Commute Hours:</strong> Wear fitted N95 mask; seal car AC on internal
              recirculation.
            </div>
            <div>
              <strong>Midday (11:00-15:00):</strong> Optimal outdoor window if sunlight breaks
              surface inversion.
            </div>
            <div>
              <strong>Night (20:00-06:00):</strong> Run HEPA filter on quiet/sleep mode in closed
              bedrooms.
            </div>
          </div>
        </div>

        {/* Essential Home Air Hacks */}
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
            2. Essential Home Air Safeguards
          </h2>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            <li>Seal main exterior door bottom gaps with damp rolled towels or weatherstrips.</li>
            <li>Zero indoor burning: avoid incense (agarbatti), mosquito coils, or dhoop.</li>
            <li>Always run kitchen exhaust during cooking; cover pans to suppress oil mist.</li>
            <li>Do not dry sweep or vacuum without HEPA exhaust; damp mop floors instead.</li>
          </ul>
        </div>

        {/* Medical & Emergency Contact Lines */}
        <div className="space-y-1 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
            3. Emergency Contacts & Medical Assistance
          </h2>
          <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
            <div>Family Doctor / Pediatrician: ___________________________________</div>
            <div>Nearest 24/7 Hospital Emergency: _________________________________</div>
            <div>
              National Emergency Helpline: <strong>112</strong>
            </div>
            <div>
              Ambulance Helpline: <strong>102 / 108</strong>
            </div>
          </div>
        </div>

        {/* Medical Footer */}
        <div className="border-t border-black pt-2 text-[10px] italic">
          Emergency Note: If experiencing breathlessness, severe wheezing, chest tight discomfort,
          or blue lips/fingertips, immediately seek emergency clinical care.
        </div>
      </div>
    </div>
  );
}
