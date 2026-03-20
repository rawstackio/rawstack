// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('User Account Menu and Logout', () => {
  test('Log out clears session and returns to Login page', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    // expect: The Dashboard is displayed
    await expect(page.getByText('This is your dashboard...')).toBeVisible();

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // 2. Click the user menu button in the sidebar footer
    await sidebar.getByText(adminEmail).click();

    // expect: The dropdown menu appears
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // 3. Click 'Log out'
    await menu.getByRole('menuitem', { name: 'Log out' }).click();

    // expect: The user is logged out
    // expect: The Login page is displayed
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();

    // expect: Protected routes are no longer accessible without re-authenticating
    await page.goto('http://localhost:5173/users');
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();
  });
});
