// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Header shows Login button when user is not authenticated', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/ in a fresh session with no auth data
    await page.goto('http://localhost:3000/');

    // expect: The header displays a 'Login' button linking to /login
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');

    // expect: No user avatar or account dropdown is visible
    await expect(page.getByText('RS', { exact: true })).not.toBeVisible();
  });
});
