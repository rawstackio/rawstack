// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Delete a user from the Edit Account drawer', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    // 2. Click 'Edit' on a non-own-account user row to open the Edit Account drawer
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    const nonOwnRow = rows.filter({ hasNotText: adminEmail }).first();

    await nonOwnRow.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByText('Edit Account')).toBeVisible();

    // expect: A 'Delete' button with destructive styling is visible
    const deleteBtn = page.getByRole('button', { name: 'Delete' });
    await expect(deleteBtn).toBeVisible();

    // 3. Click the 'Delete' button
    await deleteBtn.click();

    // expect: A success toast appears with the message 'User deleted successfully'
    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });
});
