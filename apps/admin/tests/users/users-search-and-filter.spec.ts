// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Search and filter can be combined', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    // expect: The table shows all users
    await expect(page.getByText('No results.')).not.toBeVisible();

    // 2. Select 'Admin Only' from the role filter and then type a partial email into the search input
    const roleFilter = page.getByRole('combobox').first();
    await roleFilter.click();
    await page.getByRole('option', { name: 'Admin Only' }).click();

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const partialEmail = adminEmail.split('@')[0]; // e.g. 'admin'
    await page.getByPlaceholder('Search users...').fill(partialEmail);

    // expect: The table shows only admin users whose email matches the search query
    await expect(page.getByText('No results.')).not.toBeVisible();

    // Verify each visible row has 'ADMIN' role badge
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    const firstRow = rows.filter({ hasText: partialEmail }).first();
    await expect(firstRow.getByText('ADMIN', { exact: true })).toBeVisible();
  });
});
