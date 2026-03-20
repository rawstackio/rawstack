// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('User Account Menu and Logout', () => {
  test('Account drawer can be closed', async ({ page }) => {
    // Open the Account drawer via the user menu
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();

    // expect: The drawer is open and visible
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // 2. Click the X (close) button in the drawer header
    await page.getByRole('button', { name: 'Close' }).click();

    // expect: The drawer slides closed and is no longer visible
    await expect(page.getByText('Edit Your Account')).not.toBeVisible();

    // expect: The main page content is fully visible and interactive again
    await expect(page.getByText('This is your dashboard...')).toBeVisible();
  });
});
