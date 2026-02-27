// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('Breadcrumb link navigates back to Dashboard from a sub-page', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');

    // expect: The breadcrumb shows 'Dashboard > Users'
    await expect(page.getByLabel('breadcrumb').getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('navigation').getByText('Users')).toBeVisible();

    // 2. Click the 'Dashboard' breadcrumb link
    await page.getByLabel('breadcrumb').getByRole('link', { name: 'Dashboard' }).click();

    // expect: The URL changes to http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Dashboard page is rendered
    await expect(page.getByText('This is your dashboard...')).toBeVisible();
  });
});
