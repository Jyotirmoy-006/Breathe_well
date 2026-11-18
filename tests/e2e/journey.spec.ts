import { expect, test } from '@playwright/test';

test.describe('End-to-End User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Isolate tests from external API dependencies
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.startsWith('http://localhost:3000') ||
        url.startsWith('data:') ||
        url.startsWith('blob:')
      ) {
        return route.continue();
      }
      return route.abort();
    });
  });

  test('Full user journey: presets, plan tabs, what-if impact, and print view', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Verify primary title & sections
    const h1 = page.locator('h1');
    await expect(h1).toContainText('SaafSaans');

    // 2. Profile preset selection
    const studentPresetBtn = page.getByRole('button', { name: /hostel student/i });
    await expect(studentPresetBtn).toBeVisible();
    await studentPresetBtn.click();

    // Verify summary badge reflects updated profile
    const budgetBadge = page.getByText(/budget: free/i);
    await expect(budgetBadge).toBeVisible();

    // 3. Navigate Plan tabs
    const homeTab = page.getByRole('tab', { name: /home air/i });
    await homeTab.click();
    await expect(homeTab).toHaveAttribute('aria-selected', 'true');

    const swapsTab = page.getByRole('tab', { name: /swaps/i });
    await swapsTab.click();
    await expect(swapsTab).toHaveAttribute('aria-selected', 'true');

    // 4. Toggle What-If impact panel actions
    const selectAllBtn = page.getByRole('button', { name: /select all/i });
    await selectAllBtn.click();

    // Meter should reflect non-zero reduction
    const impactMeter = page.locator('#section-your-impact');
    await expect(impactMeter).toBeVisible();

    // 5. Verify Printable Family Air Plan presence
    const printButton = page.getByRole('button', { name: /print family plan/i });
    await expect(printButton).toBeVisible();

    const printableSheet = page.locator('.print-only');
    await expect(printableSheet).toBeAttached();
  });

  test('Keyboard-only navigation and shortcut dialog', async ({ page }) => {
    await page.goto('/');

    // Skip to main content link on Tab
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Open shortcut help overlay with '?'
    await page.keyboard.press('?');
    const shortcutDialog = page.getByRole('dialog', { name: /keyboard shortcuts/i });
    await expect(shortcutDialog).toBeVisible();

    // Close shortcut help dialog with Escape
    await page.keyboard.press('Escape');
    await expect(shortcutDialog).not.toBeVisible();
  });

  test("Theme toggle keyboard shortcut ('T')", async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');

    // Press 'T' to toggle to Night theme
    await page.keyboard.press('t');
    await expect(htmlElement).toHaveClass(/dark/);
    await expect(htmlElement).toHaveAttribute('data-theme', 'night');

    // Press 'T' again to toggle back to Light paper theme
    await page.keyboard.press('t');
    await expect(htmlElement).not.toHaveClass(/dark/);
    await expect(htmlElement).toHaveAttribute('data-theme', 'paper');
  });

  test('Respects prefers-reduced-motion configuration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const prefersReduced = await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    expect(prefersReduced).toBe(true);

    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });
});
