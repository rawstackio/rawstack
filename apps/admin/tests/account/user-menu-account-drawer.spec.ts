// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('User Account Menu and Logout', () => {
  test('Clicking Account in user menu opens the account drawer', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // 2. Click the user menu button in the sidebar footer, then click 'Account'
    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();

    // expect: A slide-in drawer opens from the right on desktop (or from the bottom on mobile)
    // expect: The drawer title reads 'Edit Your Account'
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // expect: The Account form is displayed inside the drawer
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  });
});
