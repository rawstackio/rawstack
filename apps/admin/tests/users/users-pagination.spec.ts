// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Pagination controls navigate between pages', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user with enough users to span multiple pages
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    const firstPageBtn = page.getByRole('button', { name: 'Go to first page' });
    const prevPageBtn = page.getByRole('button', { name: 'Go to previous page' });
    const nextPageBtn = page.getByRole('button', { name: 'Go to next page' });
    const lastPageBtn = page.getByRole('button', { name: 'Go to last page' });

    // expect: The pagination shows 'Page 1 of N' where N > 1
    await expect(page.getByText(/Page 1 of/)).toBeVisible();

    // expect: The first-page and previous-page buttons are disabled
    await expect(firstPageBtn).toBeDisabled();
    await expect(prevPageBtn).toBeDisabled();

    // expect: The next-page and last-page buttons are enabled
    await expect(nextPageBtn).toBeEnabled();
    await expect(lastPageBtn).toBeEnabled();

    // 2. Click the next-page button
    await nextPageBtn.click();

    // expect: The pagination shows 'Page 2 of N'
    await expect(page.getByText(/Page 2 of/)).toBeVisible();

    // expect: The first-page and previous-page buttons become enabled
    await expect(firstPageBtn).toBeEnabled();
    await expect(prevPageBtn).toBeEnabled();

    // 3. Click the last-page button
    await lastPageBtn.click();

    // expect: The next-page and last-page buttons are disabled
    await expect(nextPageBtn).toBeDisabled();
    await expect(lastPageBtn).toBeDisabled();

    // 4. Click the first-page button
    await firstPageBtn.click();

    // expect: The pagination shows 'Page 1 of N'
    await expect(page.getByText(/Page 1 of/)).toBeVisible();

    // expect: The first-page and previous-page buttons are disabled again
    await expect(firstPageBtn).toBeDisabled();
    await expect(prevPageBtn).toBeDisabled();
  });
});
