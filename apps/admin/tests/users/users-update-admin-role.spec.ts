// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test("Update a user's admin role toggle", async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    // 2. Click 'Edit' on a non-own-account user row to open the Edit Account drawer
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    const nonOwnRow = rows.filter({ hasNotText: adminEmail }).first();

    await nonOwnRow.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByText('Edit Account', { exact: true })).toBeVisible();

    // expect: The Admin toggle switch is enabled (not disabled)
    const adminToggle = page.locator('#admin-role');
    await expect(adminToggle).toBeEnabled();

    // 3. Toggle the Admin switch and click 'Update'
    await adminToggle.click();
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: A success toast appears with the message 'User updated successfully'
    await expect(page.getByText('User updated successfully')).toBeVisible();
  });
});
