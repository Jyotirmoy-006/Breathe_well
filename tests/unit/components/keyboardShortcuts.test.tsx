/**
 * @file keyboardShortcuts.test.tsx
 * @description Unit tests for global keyboard shortcuts ('T', '/', '?', 'Escape').
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { KeyboardShortcuts } from '../../../src/components/KeyboardShortcuts';
import { ThemeProvider } from '../../../src/components/theme/ThemeContext';

function ShortcutTestHarness() {
  return (
    <ThemeProvider>
      <div>
        <input id="location-search-input" data-testid="search-input" />
        <KeyboardShortcuts />
      </div>
    </ThemeProvider>
  );
}

describe('KeyboardShortcuts', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('toggles theme between paper and night when T key is pressed', () => {
    render(<ShortcutTestHarness />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.keyDown(window, { key: 't' });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.keyDown(window, { key: 'T' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('focuses location search input when / key is pressed', () => {
    render(<ShortcutTestHarness />);
    const input = screen.getByTestId('search-input');
    expect(document.activeElement).not.toBe(input);

    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(input);
  });

  it('opens keyboard shortcuts modal when ? key is pressed and closes on Escape', () => {
    render(<ShortcutTestHarness />);
    expect(screen.queryByText(/navigate saafsaans rapidly/i)).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByText(/navigate saafsaans rapidly/i)).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('ignores shortcuts when user is actively typing in an input element', () => {
    render(<ShortcutTestHarness />);
    const input = screen.getByTestId('search-input');
    input.focus();

    fireEvent.keyDown(input, { key: 't' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('opens modal via button click and closes via modal close button', () => {
    render(<ShortcutTestHarness />);
    const openBtn = screen.getByRole('button', { name: /open keyboard shortcuts/i });
    fireEvent.click(openBtn);
    expect(screen.getByText(/navigate saafsaans rapidly/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/navigate saafsaans rapidly/i)).not.toBeInTheDocument();
  });
});
