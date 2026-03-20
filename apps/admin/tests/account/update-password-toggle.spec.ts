// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Account Form (Edit Own Account)', () => {
  test('Update Password toggle enables and disables password fields', async ({ page }) => {
    // 1. Open the Account drawer for the current user (own account)
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    const passwordField = page.locator('input[placeholder="new password"]');
    const confirmPasswordField = page.locator('input[placeholder="confirm password"]');
    const passwordToggle = page.locator('#password-update');

    // expect: The 'Update Password' toggle is off
    // expect: The password and confirm password fields are disabled and visually dimmed
    await expect(passwordField).toBeDisabled();
    await expect(confirmPasswordField).toBeDisabled();

    // 2. Toggle the 'Update Password' switch to the on position
    await passwordToggle.click();

    // expect: The password and confirm password fields become enabled and fully opaque
    await expect(passwordField).toBeEnabled();
    await expect(confirmPasswordField).toBeEnabled();

    // 3. Toggle the 'Update Password' switch back to the off position
    await passwordToggle.click();

    // expect: The password and confirm password fields are disabled again
    await expect(passwordField).toBeDisabled();
    await expect(confirmPasswordField).toBeDisabled();
  });
});
