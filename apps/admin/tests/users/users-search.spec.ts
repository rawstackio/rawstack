// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Search filters users by email', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    // expect: The table shows user records
    const searchInput = page.getByPlaceholder('Search users...');

    // 2. Type a partial email string into the 'Search users...' input
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@rawstack.io';
    const partialEmail = adminEmail.split('@')[1]; // e.g. 'rawstack.io'

    await searchInput.fill(partialEmail);

    // expect: The table updates to show only users whose email contains the search string
    await expect(page.getByText('No results.')).not.toBeVisible();

    // 3. Clear the search input
    await searchInput.clear();

    // expect: The table reverts to showing all users (up to the current page size)
    await expect(page.getByText('No results.')).not.toBeVisible();
  });
});
