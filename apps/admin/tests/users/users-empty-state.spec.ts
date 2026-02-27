// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Empty state is shown when no users match', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    // 2. Type a search query that matches no users (e.g. 'zzznoresults@example.com') into the search input
    await page.getByPlaceholder('Search users...').fill('zzznoresults@example.com');

    // expect: The table body shows a 'No results.' message spanning all columns
    await expect(page.getByText('No results.')).toBeVisible();
  });
});
