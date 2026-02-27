// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Users table displays user data correctly', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    await page.goto('http://localhost:5173/users');

    // Wait for at least one data row to appear (not the empty state)
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(page.getByText('No results.')).not.toBeVisible();

    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    const firstRow = rows.first();

    // expect: Each row has a user icon in the first column
    // (IconUserCircle is rendered as svg in first cell)
    await expect(firstRow.locator('svg').first()).toBeVisible();

    // expect: Each row shows the user's email address in the Email column
    await expect(firstRow.getByText(/@/).first()).toBeVisible();

    // expect: Each row shows a 'Verified' or 'Unverified' badge in the Status column
    const statusBadge = firstRow.getByText(/^(Verified|Unverified)$/);
    await expect(statusBadge).toBeVisible();

    // expect: Each row has an 'Edit' button in the actions column
    await expect(firstRow.getByRole('button', { name: 'Edit' })).toBeVisible();
  });
});
