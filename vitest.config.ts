import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
        'src/domain/**': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/app/**',
        'src/server/logger.ts',
        'src/server/env.ts',
        'src/server/http.ts',
        'node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
