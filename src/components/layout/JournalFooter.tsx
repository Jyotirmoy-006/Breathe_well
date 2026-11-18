/**
 * @file JournalFooter.tsx
 * @description Accessible editorial footer with Open-Meteo attribution, CPCB reference, and privacy policy.
 */

import React from 'react';

/**
 * Editorial footer providing citations, regulatory links, and privacy disclosures.
 */
export function JournalFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-stone-300 dark:border-stone-800 bg-[#FAF6EE] dark:bg-[#1A1D23] py-8 text-xs text-stone-600 dark:text-stone-400">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-serif font-bold text-stone-900 dark:text-stone-100">
              SaafSaans (साफ़ साँस)
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Personalized Winter Smog Defense Protocol
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 dark:hover:text-stone-100"
            >
              Open-Meteo API
            </a>
            <a
              href="https://app.cpcbccr.com/AQI_India/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 dark:hover:text-stone-100"
            >
              CPCB India AQI
            </a>
            <a
              href="https://safar.tropmet.res.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 dark:hover:text-stone-100"
            >
              SAFAR Air Quality
            </a>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <p>
            Privacy Notice: Zero personally identifiable information collected. Geolocation
            coordinates truncated to 2 decimals (~1.1 km resolution).
          </p>
          <span className="font-mono text-stone-600 dark:text-stone-400">
            v0.1.0 • Built with Google DeepMind
          </span>
        </div>
      </div>
    </footer>
  );
}
