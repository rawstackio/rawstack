// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Reset Password button is disabled for invalid email format', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The reset password form is displayed
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // 2. Type 'notanemail' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');

    // expect: The text is entered into the Email field
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('notanemail');

    // 3. Observe the 'Reset Password' button state
    // expect: The 'Reset Password' button remains disabled due to invalid email format
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
  });
});
