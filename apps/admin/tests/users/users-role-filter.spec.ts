// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Role filter shows only users with the selected role', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    const roleFilter = page.getByRole('combobox').first();

    // expect: The role filter shows 'All Roles' by default
    await expect(roleFilter).toContainText('All Roles');

    // 2. Open the role filter dropdown and select 'Admin Only'
    await roleFilter.click();
    await page.getByRole('option', { name: 'Admin Only' }).click();

    // expect: The table updates to show only users who have the ADMIN role
    await expect(page.getByRole('cell', { name: 'ADMIN', exact: true })).toBeVisible();

    // 3. Open the role filter dropdown and select 'Verified Users'
    await roleFilter.click();
    await page.getByRole('option', { name: 'Verified Users' }).click();

    // expect: The table updates to show only users with the VERIFIED_USER role
    await expect(page.getByRole('cell', { name: 'VERIFIED_USER' })).toBeVisible();

    // 4. Open the role filter dropdown and select 'All Roles'
    await roleFilter.click();
    await page.getByRole('option', { name: 'All Roles' }).click();

    // expect: The table reverts to showing all users regardless of role
    await expect(page.getByText('No results.')).not.toBeVisible();
  });
});
