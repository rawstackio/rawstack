// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Cannot remove admin role from own account', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    // 2. Locate the row corresponding to the currently authenticated admin user and click 'Edit'
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const ownRow = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') })
      .filter({ hasText: adminEmail })
      .first();

    await ownRow.getByRole('button', { name: 'Edit' }).click();

    // expect: The Edit Account drawer opens with the title 'Edit Your Account'
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // expect: The 'Update Password' toggle is visible (own account feature)
    await expect(page.locator('#password-update')).toBeVisible();

    // expect: The Admin toggle is disabled (cannot remove own admin role)
    await expect(page.locator('#admin-role')).toBeDisabled();
  });
});
