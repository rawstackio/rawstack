// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('Theme toggle switches between Dark and Light mode', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    // expect: The site header shows a Moon icon indicating Dark mode is currently active
    const moonButton = page.getByRole('button', { name: 'moon' });
    await expect(moonButton).toBeVisible();

    // 2. Click the theme toggle button (Moon icon) in the site header
    await moonButton.click();

    // expect: The icon changes to a Sun icon indicating Light mode is now active
    const sunButton = page.getByRole('button', { name: 'sun' });
    await expect(sunButton).toBeVisible();
    await expect(moonButton).not.toBeVisible();

    // expect: The page appearance changes to reflect the Light theme
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // 3. Click the theme toggle button again (Sun icon)
    await sunButton.click();

    // expect: The icon changes back to a Moon icon
    await expect(moonButton).toBeVisible();
    await expect(sunButton).not.toBeVisible();

    // 4. Reload the page
    await page.reload();

    // expect: The theme previously selected is persisted (stored in localStorage) and applied on load
    await expect(page.getByRole('button', { name: 'moon' })).toBeVisible();
  });
});
