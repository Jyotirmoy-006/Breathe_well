// @ts-check
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Base TypeScript strict config
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      // Code budget rules
      'max-lines': ['error', 200],
      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],

      // No console outside logger.ts
      'no-console': 'error',

      // No default exports except Next.js-required files
      'import/no-default-export': 'error',

      // Import ordering
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',

      // TypeScript strict overrides
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  // Allow default exports in Next.js required files
  {
    files: [
      'src/app/**/{layout,page,error,not-found,loading,template}.tsx',
      'src/app/**/route.ts',
      'next.config.mjs',
      'playwright.config.ts',
      'vitest.config.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Allow console in logger.ts only
  {
    files: ['src/server/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Test files: relax some rules
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-lines': ['error', 300],
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'scripts/**',
    ],
  },
);
