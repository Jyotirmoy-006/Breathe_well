import { expect, test } from '@playwright/test';

test.describe('Health API', () => {
  test('returns status ok and application mode', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBe(true);
    const body = (await response.json()) as {
      status: string;
      timestamp: string;
      mode: string;
    };
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(['ai', 'rule-based']).toContain(body.mode);
  });
});

test.describe('Home Page', () => {
  test('loads home page with heading and main content', async ({ page }) => {
    // Mock external network calls to ensure isolation
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith('http://localhost:3000')) {
        return route.continue();
      }
      return route.abort();
    });

    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toContainText('SaafSaans');
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });
});
