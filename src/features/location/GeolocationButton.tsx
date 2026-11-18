/**
 * @file GeolocationButton.tsx
 * @description Privacy-conscious browser geolocation trigger rounding coordinates to 2 decimals.
 */

'use client';

import React, { useState } from 'react';

import type { LocationItem } from './types';

export interface GeolocationButtonProps {
  readonly onLocationDetected: (loc: LocationItem) => void;
  readonly className?: string;
}

function roundToTwoDecimals(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Trigger for browser geolocation with automatic 2-decimal privacy truncation.
 */
export function GeolocationButton({
  onLocationDetected,
  className = '',
}: GeolocationButtonProps): React.JSX.Element {
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleGetLocation = (): void => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = roundToTwoDecimals(pos.coords.latitude);
        const lon = roundToTwoDecimals(pos.coords.longitude);
        onLocationDetected({
          id: Math.floor(lat * 1000 + lon),
          name: `My Location (${String(lat)}°, ${String(lon)}°)`,
          latitude: lat,
          longitude: lon,
          admin1: 'Nearby',
          country: 'India',
        });
      },
      (err) => {
        setIsLocating(false);
        setStatusMessage(err.message || 'Unable to retrieve your location.');
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={isLocating}
        aria-label="Use my current location"
        className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] ${className}`}
      >
        <span aria-hidden="true">📍</span>
        <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Use my location'}</span>
      </button>
      {statusMessage && (
        <span role="status" className="sr-only">
          {statusMessage}
        </span>
      )}
    </div>
  );
}
