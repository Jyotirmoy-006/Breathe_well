/**
 * @file ThemeContext.tsx
 * @description Theme context provider managing paper and night themes with persistent storage.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'paper' | 'night';

interface ThemeContextValue {
  readonly theme: Theme;
  readonly toggleTheme: () => void;
  readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'saafsaans-theme';

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'night') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'night');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'paper');
  }
}

/**
 * Provides theme state and toggles across light paper and night themes.
 */
export function ThemeProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>('paper');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === 'night' || stored === 'paper') {
      setThemeState(stored);
      applyThemeToDocument(stored);
    } else if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setThemeState('night');
      applyThemeToDocument('night');
    }
  }, []);

  const setTheme = (nextTheme: Theme): void => {
    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyThemeToDocument(nextTheme);
  };

  const toggleTheme = (): void => {
    setTheme(theme === 'paper' ? 'night' : 'paper');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook accessing current theme and toggle handler.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
