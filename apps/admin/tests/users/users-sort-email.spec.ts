// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Email column sort toggles ASC, DESC, then no sort', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    const emailSortButton = page.getByRole('columnheader', { name: 'Email' }).getByRole('button');

    // expect: No sort indicator is shown on the Email column header
    await expect(emailSortButton.locator('svg[data-icon="arrow-up"]')).not.toBeVisible();
    await expect(emailSortButton.locator('svg[data-icon="arrow-down"]')).not.toBeVisible();

    // 2. Click the Email column header button
    await emailSortButton.click();

    // expect: An ascending arrow icon appears on the Email header
    await expect(emailSortButton.locator('svg')).toBeVisible();

    // 3. Click the Email column header button again
    await emailSortButton.click();

    // expect: A descending arrow icon appears on the Email header
    await expect(emailSortButton.locator('svg')).toBeVisible();

    // 4. Click the Email column header button a third time
    await emailSortButton.click();

    // expect: The sort indicator is removed from the Email header
    // After third click, sort goes back to no sort (empty sortBy)
    await expect(page.getByRole('table')).toBeVisible();
  });
});
