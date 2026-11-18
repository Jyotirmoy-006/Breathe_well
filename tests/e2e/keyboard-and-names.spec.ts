/**
 * @file keyboard-and-names.spec.ts
 * @description Playwright E2E tests for keyboard-only interaction and accessible names on all interactive controls.
 */

import { expect, test } from '@playwright/test';

test.describe('Keyboard-Only Navigation & Accessible Names', () => {
  test('all interactive elements have a non-empty accessible name', async ({ page }) => {
    await page.goto('/');

    const elementsWithoutNames = await page.evaluate(() => {
      const interactives = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [role="button"], [role="tab"], [role="checkbox"]',
        ),
      );

      const failures: { tag: string; html: string }[] = [];

      for (const el of interactives) {
        // Skip hidden elements
        if (el.offsetParent === null && el.getAttribute('type') !== 'hidden') {
          continue;
        }

        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const textContent = el.textContent?.trim();
        const title = el.getAttribute('title');
        const placeholder = el instanceof HTMLInputElement ? el.placeholder : null;
        const alt = el.querySelector('img')?.getAttribute('alt');

        // Check HTML label associations (label for=id or wrapping label or input.labels)
        const hasAssociatedLabel = Boolean(
          (el instanceof HTMLInputElement && el.labels && el.labels.length > 0) ||
          (el.id && document.querySelector(`label[for="${el.id}"]`)) ||
          el.closest('label'),
        );

        const hasName = Boolean(
          (ariaLabel && ariaLabel.trim().length > 0) ||
          (ariaLabelledBy && ariaLabelledBy.trim().length > 0) ||
          (textContent && textContent.length > 0) ||
          (title && title.trim().length > 0) ||
          (placeholder && placeholder.trim().length > 0) ||
          (alt && alt.trim().length > 0) ||
          hasAssociatedLabel,
        );

        if (!hasName) {
          failures.push({
            tag: el.tagName.toLowerCase(),
            html: el.outerHTML.slice(0, 150),
          });
        }
      }

      return failures;
    });

    expect(elementsWithoutNames).toEqual([]);
  });

  test('keyboard-only navigation operates key interactive workflows', async ({ page }) => {
    await page.goto('/');

    // 1. Open keyboard shortcuts dialog via '?' (from document body)
    await page.locator('body').focus();
    await page.keyboard.press('?');
    const shortcutDialog = page.getByRole('dialog', { name: /keyboard shortcuts/i });
    await expect(shortcutDialog).toBeVisible();

    // 2. Dismiss dialog via Escape
    await page.keyboard.press('Escape');
    await expect(shortcutDialog).not.toBeVisible();

    // 3. Toggle theme via 'T' key
    await page.keyboard.press('t');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.keyboard.press('t');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');

    // 4. Select preset via keyboard
    const commuterPreset = page.getByRole('button', { name: /daily commuter/i });
    await commuterPreset.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/two-wheeler/i).first()).toBeVisible();

    // 5. Navigate tabs via keyboard
    const homeTab = page.getByRole('tab', { name: /home air/i });
    await homeTab.focus();
    await page.keyboard.press('Enter');
    await expect(homeTab).toHaveAttribute('aria-selected', 'true');

    // 6. Toggle Table View on Timeline
    const tableToggle = page.getByRole('button', { name: /view as table/i });
    await tableToggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('table')).toBeVisible();

    // Toggle back to SVG
    const chartToggle = page.getByRole('button', { name: /view chart/i });
    await chartToggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('table')).not.toBeVisible();

    // 7. Open Explanation Drawer
    const explainBtn = page.getByRole('button', { name: /how we estimate this/i });
    await explainBtn.focus();
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: /how we estimate your impact/i });
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });
});
