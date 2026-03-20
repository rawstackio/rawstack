// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Edit button on a user row opens the Edit Account drawer', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    // expect: At least one user row is visible with an 'Edit' button
    const editButtons = page.getByRole('button', { name: 'Edit' });
    await expect(editButtons.first()).toBeVisible();

    // 2. Click the 'Edit' button on any non-own-account user row
    // Find a row that doesn't belong to the logged-in admin user
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    const nonOwnRow = rows.filter({ hasNotText: adminEmail }).first();

    await nonOwnRow.getByRole('button', { name: 'Edit' }).click();

    // expect: A slide-in drawer opens
    // expect: The drawer title reads 'Edit Account'
    await expect(page.getByText('Edit Account', { exact: true })).toBeVisible();

    // expect: The Account form is displayed with a read-only Id field
    await expect(page.locator('input[readonly]')).toBeVisible();

    // expect: The user's email is pre-populated
    await expect(page.locator('input[placeholder="email"]')).not.toHaveValue('');

    // expect: An Admin toggle switch (enabled)
    const adminToggle = page.locator('#admin-role');
    await expect(adminToggle).toBeVisible();
    await expect(adminToggle).toBeEnabled();

    // expect: An 'Update' button and a 'Delete' button are present
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    // expect: There is no 'Update Password' toggle (own-account only feature)
    await expect(page.locator('#password-update')).not.toBeVisible();
  });
});
