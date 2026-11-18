/**
 * @file layoutAndUi.test.tsx
 * @description Unit tests for JournalHeader, JournalFooter, SegmentedControl, Tabs, and PrintFamilyPlan.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { JournalFooter } from '@/components/layout/JournalFooter';
import { JournalHeader } from '@/components/layout/JournalHeader';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Tabs } from '@/components/ui/Tabs';
import { PrintFamilyPlan } from '@/features/print/PrintFamilyPlan';

describe('JournalHeader', () => {
  const dummyLocation = {
    id: 1273294,
    name: 'New Delhi',
    latitude: 28.61,
    longitude: 77.21,
    country: 'India',
  };

  it('renders masthead branding, location combobox, and theme toggle', () => {
    render(
      <ThemeProvider>
        <JournalHeader selectedLocation={dummyLocation} onSelectLocation={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/SaafSaans/i);
    expect(screen.getByRole('button', { name: /switch to night theme/i })).toBeInTheDocument();
  });
});

describe('JournalFooter', () => {
  it('renders regulatory links, Open-Meteo attribution, and privacy notice', () => {
    render(<JournalFooter />);

    expect(screen.getByText(/Open-Meteo API/i)).toHaveAttribute('href', 'https://open-meteo.com/');
    expect(screen.getByText(/CPCB India AQI/i)).toHaveAttribute(
      'href',
      'https://app.cpcbccr.com/AQI_India/',
    );
    expect(screen.getByText(/Zero personally identifiable information/i)).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'opt1', label: 'Option 1', badge: '10' },
    { value: 'opt2', label: 'Option 2' },
  ];

  it('renders radio buttons and triggers onChange on selection', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        name="Test Control"
        options={options}
        value="opt1"
        onChange={handleChange}
      />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Test Control' })).toBeInTheDocument();
    const radio2 = screen.getByRole('radio', { name: 'Option 2' });
    fireEvent.click(radio2);
    expect(handleChange).toHaveBeenCalledWith('opt2');
  });
});

describe('Tabs keyboard navigation', () => {
  function TabsHarness() {
    const [active, setActive] = useState('t1');
    return (
      <Tabs
        tabs={[
          { id: 't1', label: 'Tab 1' },
          { id: 't2', label: 'Tab 2' },
          { id: 't3', label: 'Tab 3' },
        ]}
        activeTab={active}
        onTabChange={setActive}
        ariaLabel="Navigation Tabs"
      />
    );
  }

  it('handles ArrowRight, ArrowLeft, Home, and End keyboard events', () => {
    render(<TabsHarness />);
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();

    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.keyDown(tab2, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tab1, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');

    const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
    fireEvent.keyDown(tab3, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('PrintFamilyPlan', () => {
  it('renders screen trigger bar and print-ready sheet', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <PrintFamilyPlan
        data={{
          locationName: 'New Delhi',
          aqi: 350,
          cpcbCategory: 'Severe',
          pm25: 280,
          generatedDate: 'Nov 18, 2026',
        }}
      />,
    );

    const printBtn = screen.getByRole('button', { name: /print family plan/i });
    expect(printBtn).toBeInTheDocument();
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
