/**
 * @file heroComponents.test.tsx
 * @description Unit tests for HeroSection, AqiDial, HeroVerdict, and SkylineHaze.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AqiDial } from '@/features/hero/AqiDial';
import { HeroSection } from '@/features/hero/HeroSection';
import { HeroVerdict } from '@/features/hero/HeroVerdict';
import { SkylineHaze } from '@/features/hero/SkylineHaze';
import { BASELINE_LIVE_METRICS } from '@/features/journal/journalBaseline';

describe('AqiDial', () => {
  it('renders circular dial with PM2.5 and WHO multiple badge', () => {
    render(
      <AqiDial pm25={285} pm10={410} no2={68} aqi={395} category="Very Poor" whoMultiple={19.0} />,
    );

    expect(
      screen.getByRole('img', { name: /current air quality index: 395/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('395')).toBeInTheDocument();
    expect(screen.getByText(/19× WHO/i)).toBeInTheDocument();
  });
});

describe('HeroVerdict', () => {
  it('renders plain-language verdict for severe air quality', () => {
    render(<HeroVerdict category="Severe" />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/Severe/i);
    expect(screen.getByText(/Remain indoors; keep windows sealed/i)).toBeInTheDocument();
  });

  it('renders appropriate verdict for good air quality', () => {
    render(<HeroVerdict category="Good" />);

    expect(screen.getByText(/Air quality is good with minimal health impact/i)).toBeInTheDocument();
  });
});

describe('SkylineHaze', () => {
  it('renders skyline with accessible role="img" across various PM2.5 levels', () => {
    const { rerender } = render(<SkylineHaze pm25={25} />);
    expect(screen.getByRole('img')).toBeInTheDocument();

    rerender(<SkylineHaze pm25={80} />);
    expect(screen.getByRole('img')).toBeInTheDocument();

    rerender(<SkylineHaze pm25={200} />);
    expect(screen.getByRole('img')).toBeInTheDocument();

    rerender(<SkylineHaze pm25={400} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

describe('HeroSection', () => {
  it('renders section 01 heading, dial, and preview badge when scrubbing', () => {
    render(
      <HeroSection liveMetrics={BASELINE_LIVE_METRICS} scrubberPm25={150} planMode="rule-based" />,
    );

    expect(screen.getByRole('heading', { name: /air now/i })).toBeInTheDocument();
    expect(screen.getByText(/Timeline preview: 150 µg\/m³/i)).toBeInTheDocument();
  });
});
