/**
 * @file postinstall.mjs
 * @description Compatibility postinstall hook for TypeScript 7 + typescript-eslint + ESLint 10.
 * Sets up shims for typescript-eslint and ts-api-utils to use @typescript/typescript6 API,
 * and patches eslint-plugin-import for ESLint 10 flat config.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

// 1. Setup TypeScript 6 shim for typescript-eslint and ts-api-utils
const shimTargets = [
  join(root, 'node_modules', '@typescript-eslint', 'node_modules', 'typescript'),
  join(root, 'node_modules', 'typescript-eslint', 'node_modules', 'typescript'),
  join(root, 'node_modules', 'ts-api-utils', 'node_modules', 'typescript'),
];

for (const target of shimTargets) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  const pkgPath = join(target, 'package.json');
  writeFileSync(
    pkgPath,
    JSON.stringify({ name: 'typescript', version: '6.0.3', main: './index.js' }, null, 2),
  );
  const indexPath = join(target, 'index.js');
  writeFileSync(indexPath, "module.exports = require('@typescript/typescript6');\n");
}

// 2. Patch eslint-plugin-import sourceType check for ESLint 10
const sourceTypePath = join(
  root,
  'node_modules',
  'eslint-plugin-import',
  'lib',
  'core',
  'sourceType.js',
);
if (existsSync(sourceTypePath)) {
  const content = readFileSync(sourceTypePath, 'utf8');
  if (content.includes("if ('sourceType' in context.parserOptions)")) {
    const patched = content.replace(
      "if ('sourceType' in context.parserOptions)",
      "if (context.parserOptions && 'sourceType' in context.parserOptions)",
    );
    writeFileSync(sourceTypePath, patched, 'utf8');
  }
}
