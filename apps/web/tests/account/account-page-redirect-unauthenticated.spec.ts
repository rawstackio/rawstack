// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account page redirects unauthenticated users to home page', async ({ page }) => {
    // 1. Ensure no user is logged in (fresh browser session with no auth data in localStorage)
    // expect: No user is authenticated (fresh context has empty localStorage)

    // 2. Navigate to http://localhost:3000/account
    await page.goto('http://localhost:3000/account');

    // expect: The user is redirected to http://localhost:3000/ (home page)
    await expect(page).toHaveURL('http://localhost:3000/');

    // expect: The account form with user data is not displayed
    await expect(page.getByRole('heading', { name: 'Account Settings' })).not.toBeVisible();
  });
});
