#!/usr/bin/env node
/**
 * @file check-repo-size.mjs
 * @description Checks tracked file sizes and .git directory size.
 * Fails if tracked files exceed 5 MB or .git exceeds 8 MB.
 */

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const MB = 1024 * 1024;
const MAX_TRACKED_MB = 5;
const MAX_GIT_MB = 8;

/** Get total byte size of all git-tracked files */
function getTrackedSize() {
  const output = execSync('git ls-files', { cwd: root, encoding: 'utf8' });
  const files = output.trim().split('\n').filter(Boolean);
  let total = 0;
  for (const file of files) {
    try {
      const stats = statSync(join(root, file));
      total += stats.size;
    } catch {
      // file may have been deleted; skip
    }
  }
  return total;
}

/** Recursively sum directory size in bytes */
function getDirSize(dirPath) {
  try {
    const output = execSync(
      process.platform === 'win32'
        ? `(Get-ChildItem -Recurse -Force '${dirPath}' | Measure-Object -Property Length -Sum).Sum`
        : `du -sb "${dirPath}"`,
      {
        cwd: root,
        encoding: 'utf8',
        shell: process.platform === 'win32' ? 'powershell' : '/bin/sh',
      },
    );
    if (process.platform === 'win32') {
      const val = parseInt(output.trim(), 10);
      return isNaN(val) ? 0 : val;
    }
    return parseInt(output.split('\t')[0] ?? '0', 10);
  } catch {
    return 0;
  }
}

let failed = false;

const trackedBytes = getTrackedSize();
const trackedMB = trackedBytes / MB;
if (trackedMB > MAX_TRACKED_MB) {
  console.error(
    `❌ FAIL: Tracked files = ${trackedMB.toFixed(2)} MB (limit: ${MAX_TRACKED_MB} MB)`,
  );
  failed = true;
} else {
  console.log(`✅ PASS: Tracked files = ${trackedMB.toFixed(2)} MB (limit: ${MAX_TRACKED_MB} MB)`);
}

const gitBytes = getDirSize(join(root, '.git'));
const gitMB = gitBytes / MB;
if (gitMB > MAX_GIT_MB) {
  console.error(`❌ FAIL: .git size = ${gitMB.toFixed(2)} MB (limit: ${MAX_GIT_MB} MB)`);
  failed = true;
} else {
  console.log(`✅ PASS: .git size = ${gitMB.toFixed(2)} MB (limit: ${MAX_GIT_MB} MB)`);
}

if (failed) {
  process.exit(1);
}
