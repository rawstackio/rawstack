// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Set password page redirects unauthenticated users to login page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password in a fresh browser session (no auth)
    await page.goto('http://localhost:3000/set-password');

    // expect: The user is redirected to the login page
    await expect(page).toHaveURL('http://localhost:3000/login');

    // expect: The set password form is not displayed
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).not.toBeVisible();
  });
});
