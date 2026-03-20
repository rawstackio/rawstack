// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Joined (createdAt) column sort toggles ASC, DESC, then no sort', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    const joinedSortButton = page.getByRole('columnheader', { name: 'Joined' }).getByRole('button');

    // expect: No sort indicator is shown on the Joined column header
    await expect(joinedSortButton.locator('svg')).not.toBeVisible();

    // 2. Click the Joined column header button
    await joinedSortButton.click();

    // expect: An ascending arrow icon appears on the Joined header
    await expect(joinedSortButton.locator('svg')).toBeVisible();

    // 3. Click the Joined column header button again
    await joinedSortButton.click();

    // expect: A descending arrow icon appears on the Joined header
    await expect(joinedSortButton.locator('svg')).toBeVisible();

    // 4. Click the Joined column header button a third time
    await joinedSortButton.click();

    // expect: The sort indicator is removed
    await expect(joinedSortButton.locator('svg')).not.toBeVisible();

    // expect: The table reverts to the default order
    await expect(page.getByRole('table')).toBeVisible();
  });
});
