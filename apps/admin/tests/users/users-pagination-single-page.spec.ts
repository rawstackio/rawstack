// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Pagination controls are disabled on single page', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users with a result set small enough to fit on one page
    // Use a very specific search to get a single result
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    // Filter down to a single result by searching with a highly specific email prefix
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    await page.getByPlaceholder('Search users...').fill(adminEmail);

    // expect: The pagination shows 'Page 1 of 1'
    await expect(page.getByText('Page 1 of 1')).toBeVisible();

    // expect: All four pagination buttons (first, previous, next, last) are disabled
    await expect(page.getByRole('button', { name: 'Go to first page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to last page' })).toBeDisabled();
  });
});
