// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Forgot Password link navigates to reset-password page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login page is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Click the 'Forgot Password' link
    await page.getByRole('link', { name: 'Forgot Password' }).click();

    // expect: The browser navigates to http://localhost:3000/reset-password
    await expect(page).toHaveURL('http://localhost:3000/reset-password');

    // expect: The 'Reset your password' heading is visible
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
  });
});
