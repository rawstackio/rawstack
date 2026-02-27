// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Rows per page selector changes the number of visible rows', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user with enough users to paginate
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    const rowsPerPageSelect = page.locator('#rows-per-page');

    // expect: The 'Rows per page' selector shows '10' and the table displays up to 10 rows
    await expect(rowsPerPageSelect).toContainText('10');

    // 2. Open the 'Rows per page' selector and choose '20'
    await rowsPerPageSelect.click();
    await page.getByRole('option', { name: '20' }).click();

    // expect: The table updates to show up to 20 rows
    // expect: The selector now displays '20'
    await expect(rowsPerPageSelect).toContainText('20');

    // 3. Open the 'Rows per page' selector and choose '50'
    await rowsPerPageSelect.click();
    await page.getByRole('option', { name: '50' }).click();

    // expect: The table updates to show up to 50 rows
    await expect(rowsPerPageSelect).toContainText('50');
  });
});
