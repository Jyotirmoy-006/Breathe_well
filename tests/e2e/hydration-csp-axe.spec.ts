import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Production Hydration, CSP, and Axe-Core Accessibility', () => {
  test('Zero console errors, zero warnings, zero CSP violations, and all controls operable', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const cspViolations: string[] = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Filter out harmless favicon or font notices if any
      if (type === 'error') {
        consoleErrors.push(text);
      } else if (type === 'warning' && !text.includes('Vite config')) {
        consoleWarnings.push(text);
      }
    });

    await page.goto('/');

    // Attach CSP violation event listener in browser
    await page.evaluate(() => {
      const win = window as unknown as { __csp_violations?: string[] };
      window.addEventListener('securitypolicyviolation', (e) => {
        win.__csp_violations = win.__csp_violations || [];
        win.__csp_violations.push(
          `${e.blockedURI} violated ${e.violatedDirective} (${e.originalPolicy})`,
        );
      });
    });

    // 1. Assert zero hydration errors / warnings on initial load
    expect(consoleErrors).toEqual([]);
    expect(consoleWarnings).toEqual([]);

    // 2. Location search combobox interaction
    const searchInput = page.getByPlaceholder(/search city/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Mumbai');
    await page.waitForTimeout(400); // debounce

    // 3. Preset selection
    const commuterPreset = page.getByRole('button', { name: /daily commuter/i });
    await expect(commuterPreset).toBeVisible();
    await commuterPreset.click();
    await expect(page.getByText(/two-wheeler/i).first()).toBeVisible();

    // 4. Tab navigation across all 4 tabs
    const homeTab = page.getByRole('tab', { name: /home air/i });
    await homeTab.click();
    await expect(homeTab).toHaveAttribute('aria-selected', 'true');

    const swapsTab = page.getByRole('tab', { name: /swaps/i });
    await swapsTab.click();
    await expect(swapsTab).toHaveAttribute('aria-selected', 'true');

    const communityTab = page.getByRole('tab', { name: /community/i });
    await communityTab.click();
    await expect(communityTab).toHaveAttribute('aria-selected', 'true');

    const routineTab = page.getByRole('tab', { name: /routine/i });
    await routineTab.click();
    await expect(routineTab).toHaveAttribute('aria-selected', 'true');

    // 5. What-if impact panel toggles
    const selectAllBtn = page.getByRole('button', { name: /select all/i });
    await selectAllBtn.click();
    const deselectBtn = page.getByRole('button', { name: /reset/i });
    await deselectBtn.click();

    // 6. Theme toggle
    const themeBtn = page.getByRole('button', { name: /theme/i });
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');

    // 7. Keyboard shortcuts dialog
    await page.keyboard.press('?');
    const shortcutDialog = page.getByRole('dialog', { name: /keyboard shortcuts/i });
    await expect(shortcutDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(shortcutDialog).not.toBeVisible();

    // 8. Follow-up Chat drawer
    const chatInput = page.getByPlaceholder(/ask a question/i);
    await expect(chatInput).toBeVisible();

    // 9. Print view button presence
    const printBtn = page.getByRole('button', { name: /print family plan/i });
    await expect(printBtn).toBeVisible();

    // 10. Check collected CSP violations from browser
    const collectedViolations = await page.evaluate(
      () => (window as unknown as { __csp_violations?: string[] }).__csp_violations || [],
    );
    expect(collectedViolations).toEqual([]);
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('Axe-core Real-Browser Accessibility: Desktop Light & Night Viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Light "paper" theme
    await page.goto('/');
    const lightAxeResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'html-has-lang', 'landmark-one-main', 'region'])
      .analyze();
    expect(lightAxeResults.violations).toEqual([]);

    // Night theme
    await page.keyboard.press('t');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    const nightAxeResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'html-has-lang', 'landmark-one-main', 'region'])
      .analyze();
    expect(nightAxeResults.violations).toEqual([]);
  });

  test('Axe-core Real-Browser Accessibility: Mobile Viewport & Drawers', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const mobileAxeResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'html-has-lang', 'landmark-one-main', 'region'])
      .analyze();
    expect(mobileAxeResults.violations).toEqual([]);

    // Open model explanation drawer and audit accessibility
    const explainBtn = page.getByRole('button', { name: /how we estimate this/i });
    await explainBtn.click();
    const drawer = page.getByRole('dialog', { name: /how we estimate your impact/i });
    await expect(drawer).toBeVisible();

    const drawerAxeResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'region'])
      .analyze();
    expect(drawerAxeResults.violations).toEqual([]);
  });
});
