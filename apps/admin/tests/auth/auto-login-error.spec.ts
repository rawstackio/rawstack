// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Auto-login with invalid token shows error and falls back to login form', async ({ page }) => {
    // 1. Navigate with an invalid password-token
    await page.goto(
      'http://localhost:5173/?password-token=INVALID_TOKEN&email=admin%40rawstack.io',
    );

    // 2. Wait for the auto-login request to fail
    // expect: An error toast appears with the message 'Auto login failed, please login manually.'
    await expect(page.getByText('Auto login failed, please login manually.').first()).toBeVisible();

    // expect: The standard Login form is displayed with the Logo, Email field, Password field, and 'Forgot Password' button
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '*********' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });
});
