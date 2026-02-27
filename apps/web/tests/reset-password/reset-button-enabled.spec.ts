// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Reset Password button becomes enabled with a valid email', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The reset password form is displayed with the button disabled
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeDisabled();

    // 2. Type 'valid@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('valid@example.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('valid@example.com');

    // 3. Observe the 'Reset Password' button state
    // expect: The 'Reset Password' button is now enabled and clickable
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeEnabled();
  });
});
