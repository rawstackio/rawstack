// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Account Form (Edit Own Account)', () => {
  test('Updating own password with fewer than 8 characters shows validation error', async ({ page }) => {
    // 1. Open the Account drawer for the current user and toggle the 'Update Password' switch on
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    await page.locator('#password-update').click();

    // expect: The password fields are enabled
    const passwordField = page.locator('input[placeholder="new password"]');
    await expect(passwordField).toBeEnabled();

    // 2. Type fewer than 8 characters in the new password field
    await passwordField.fill('short');
    await page.keyboard.press('Tab');

    // expect: An inline error message reading 'Password must be at least 8 characters' appears
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });
});
