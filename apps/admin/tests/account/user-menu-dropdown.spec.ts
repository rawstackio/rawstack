// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('User Account Menu and Logout', () => {
  test('User menu dropdown shows Account and Log out options', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // expect: The sidebar footer shows the authenticated user's email address
    await expect(sidebar.getByText(adminEmail)).toBeVisible();

    // 2. Click the user menu button in the sidebar footer (the element showing the user email with a chevron icon)
    await sidebar.getByText(adminEmail).click();

    // expect: A dropdown menu appears
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // expect: The menu contains an 'Account' option with a user icon
    await expect(menu.getByRole('menuitem', { name: 'Account' })).toBeVisible();

    // expect: The menu contains a 'Log out' option with a logout icon
    await expect(menu.getByRole('menuitem', { name: 'Log out' })).toBeVisible();
  });
});
