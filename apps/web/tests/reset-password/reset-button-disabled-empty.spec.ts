// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Reset Password button is disabled when email field is empty', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The reset password form is displayed
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // 2. Observe the 'Reset Password' button without filling in any fields
    // expect: The 'Reset Password' button is disabled and cannot be clicked
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
  });
});
