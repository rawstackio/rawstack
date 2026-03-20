// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Users page renders table with correct columns', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');

    // expect: The page heading reads 'Rawstack Users'
    await expect(page.getByRole('heading', { name: 'Rawstack Users' })).toBeVisible();

    // expect: A subtitle reading 'Manage your users here' is visible
    await expect(page.getByText('Manage your users here')).toBeVisible();

    // expect: The user table is rendered with column headers: Email, Status, Roles, Joined, Unverified Email
    await expect(page.getByRole('columnheader', { name: 'Email', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Joined' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Unverified Email' })).toBeVisible();

    // expect: A search input with placeholder 'Search users...' is visible
    await expect(page.getByPlaceholder('Search users...')).toBeVisible();

    // expect: A role filter dropdown is visible
    await expect(page.getByRole('combobox').first()).toBeVisible();

    // expect: An 'Add User' button is visible
    await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();

    // expect: Pagination controls are visible at the bottom of the table
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeVisible();
  });
});
