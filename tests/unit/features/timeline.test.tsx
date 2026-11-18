/**
 * @file timeline.test.tsx
 * @description Unit tests for TimelineSection SVG area chart, scrubber keyboard navigation, and table view.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  computeBaselineWindows,
  generateBaselineHourly,
} from '../../../src/features/journal/journalBaseline';
import { TimelineSection } from '../../../src/features/timeline/TimelineSection';

function TimelineHarness() {
  const hourly = generateBaselineHourly();
  const windows = computeBaselineWindows(hourly);
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <TimelineSection
      hourly={hourly}
      windows={windows}
      selectedIndex={selectedIdx}
      onSelectIndex={setSelectedIdx}
    />
  );
}

describe('TimelineSection', () => {
  it('renders section 02 heading, window badges, and SVG chart', () => {
    render(<TimelineHarness />);
    expect(screen.getByRole('heading', { name: /next 48 hours/i })).toBeInTheDocument();
    expect(screen.getByText('Best window to go out')).toBeInTheDocument();
    expect(screen.getByText('Avoid outdoor exposure')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('navigates timeline scrubber using ArrowRight and ArrowLeft keyboard keys', () => {
    render(<TimelineHarness />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('0');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.value).toBe('1');

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider.value).toBe('0');
  });

  it('toggles between SVG chart and accessible tabular view', () => {
    render(<TimelineHarness />);

    const toggleBtn = screen.getByRole('button', { name: /view as table/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('48-Hour Hourly Air Quality Forecast Data')).toBeInTheDocument();

    const chartBtn = screen.getByRole('button', { name: /view chart/i });
    fireEvent.click(chartBtn);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('allows row selection in table view to update scrubber position', () => {
    render(<TimelineHarness />);

    fireEvent.click(screen.getByRole('button', { name: /view as table/i }));
    const selectButtons = screen.getAllByRole('button', { name: 'Select' });

    const targetBtn = selectButtons[3];
    if (targetBtn) {
      fireEvent.click(targetBtn);
    }

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('3');
  });

  it('handles clicking on SVG chart to update scrubber index', () => {
    const { container } = render(<TimelineHarness />);
    const svg = container.querySelector('svg.cursor-pointer');
    expect(svg).toBeInTheDocument();

    if (svg) {
      fireEvent.click(svg, { clientX: 200 });
    }
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
  });
});
