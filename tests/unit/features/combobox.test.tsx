/**
 * @file combobox.test.tsx
 * @description Unit tests for LocationCombobox keyboard navigation, debounce, and selection.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocationCombobox } from '../../../src/features/location/LocationCombobox';
import { DEFAULT_LOCATION } from '../../../src/features/location/types';
import type { LocationItem } from '../../../src/features/location/types';

const MOCK_RESULTS: readonly LocationItem[] = [
  {
    id: 1,
    name: 'Gurugram',
    latitude: 28.45,
    longitude: 77.02,
    admin1: 'Haryana',
    country: 'India',
  },
  {
    id: 2,
    name: 'Noida',
    latitude: 28.53,
    longitude: 77.39,
    admin1: 'Uttar Pradesh',
    country: 'India',
  },
];

describe('LocationCombobox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ locations: MOCK_RESULTS }),
        }),
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders input with default placeholder and keyboard hint', () => {
    render(<LocationCombobox selectedLocation={DEFAULT_LOCATION} onSelectLocation={vi.fn()} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('triggers debounced fetch on typing query', async () => {
    render(<LocationCombobox selectedLocation={DEFAULT_LOCATION} onSelectLocation={vi.fn()} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Gur' } });
    expect(globalThis.fetch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=Gur'),
      expect.anything(),
    );
  });

  it('navigates search suggestions using arrow keys and selects with Enter', async () => {
    const handleSelect = vi.fn();
    render(
      <LocationCombobox selectedLocation={DEFAULT_LOCATION} onSelectLocation={handleSelect} />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Gur' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(screen.getByText('Gurugram')).toBeInTheDocument();
    expect(screen.getByText('Noida')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSelect).toHaveBeenCalledWith(MOCK_RESULTS[1]);
  });

  it('closes dropdown when Escape key is pressed', async () => {
    render(<LocationCombobox selectedLocation={DEFAULT_LOCATION} onSelectLocation={vi.fn()} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Gur' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('invokes geolocation button on click', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success({
          coords: {
            latitude: 28.6143,
            longitude: 77.209,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const handleSelect = vi.fn();
    render(
      <LocationCombobox selectedLocation={DEFAULT_LOCATION} onSelectLocation={handleSelect} />,
    );
    const geoBtn = screen.getByRole('button', { name: /use my current location/i });
    fireEvent.click(geoBtn);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 28.61, longitude: 77.21 }),
    );
  });
});
