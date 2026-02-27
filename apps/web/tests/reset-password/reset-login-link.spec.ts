// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Login link on reset password page navigates to login page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The reset password page is displayed
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // 2. Click the 'Login' link
    await page.getByRole('link', { name: 'Login' }).click();

    // expect: The browser navigates to http://localhost:3000/login
    await expect(page).toHaveURL('http://localhost:3000/login');

    // expect: The 'Login to your account' heading is visible
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
  });
});
