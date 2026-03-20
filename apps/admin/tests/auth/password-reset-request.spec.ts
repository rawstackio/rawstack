// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Password reset request form validation and submission', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state and click 'Forgot Password'
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    const resetButton = page.getByRole('button', { name: 'Reset Password' });
    const emailInput = page.getByRole('textbox', { name: 'Email' });

    // expect: The password reset request form is displayed with 'Reset Password' button disabled
    await expect(resetButton).toBeDisabled();

    // 2. Type an invalid string into the Email field (e.g. 'bademail') and tab away
    await emailInput.fill('bademail');
    await page.keyboard.press('Tab');

    // expect: An inline validation error is displayed beneath the Email field
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // expect: The 'Reset Password' button remains disabled
    await expect(resetButton).toBeDisabled();

    // 3. Clear the field and type a valid email address
    await emailInput.clear();
    await emailInput.fill('admin@rawstack.io');

    // expect: The inline error disappears
    await expect(page.getByText('Invalid email address')).not.toBeVisible();

    // expect: The 'Reset Password' button becomes enabled
    await expect(resetButton).toBeEnabled();

    // 4. Click 'Reset Password'
    await resetButton.click();

    // expect: A success toast appears stating 'A password reset link has been sent to {email}'
    await expect(page.getByText('A password reset link has been sent to admin@rawstack.io')).toBeVisible();
  });
});
