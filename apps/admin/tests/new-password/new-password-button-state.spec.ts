// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('New Password Page', () => {
  test('Password update button is disabled until a valid password is entered', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    await page.goto('http://localhost:5173/new-password');

    const updateBtn = page.getByRole('button', { name: 'Update Password' });
    const passwordField = page.locator('input[placeholder="new password"]');
    const confirmField = page.locator('input[placeholder="confirm password"]');

    // expect: The 'Update Password' button is disabled
    await expect(updateBtn).toBeDisabled();

    // 2. Type fewer than 8 characters into the password field
    await passwordField.fill('short');
    await page.keyboard.press('Tab');

    // expect: An inline error message 'Password must be at least 8 characters' appears
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();

    // expect: The 'Update Password' button remains disabled
    await expect(updateBtn).toBeDisabled();

    // 3. Type 8 or more characters into the password field and matching text into the confirm field
    await passwordField.fill('newpassword123');
    await confirmField.fill('newpassword123');

    // expect: No validation errors are shown
    await expect(page.getByText('Password must be at least 8 characters')).not.toBeVisible();

    // expect: The 'Update Password' button becomes enabled
    await expect(updateBtn).toBeEnabled();
  });
});
