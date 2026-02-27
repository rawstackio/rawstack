// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('Sidebar navigation links are present and functional', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // expect: The sidebar contains a 'Dashboard' navigation link
    await expect(sidebar.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    // expect: The sidebar contains a 'Users' navigation link
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();

    // expect: The RawStack logo is visible in the sidebar header
    await expect(sidebar.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // expect: The current user's email is displayed in the sidebar footer
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    await expect(sidebar.getByText(adminEmail)).toBeVisible();

    // 2. Click the 'Users' link in the sidebar
    await sidebar.getByRole('link', { name: 'Users' }).click();

    // expect: The URL changes to http://localhost:5173/users
    await expect(page).toHaveURL('http://localhost:5173/users');

    // expect: The Users management page is rendered with the heading 'Rawstack Users'
    await expect(page.getByRole('heading', { name: 'Rawstack Users' })).toBeVisible();

    // 3. Click the 'Dashboard' link in the sidebar
    await sidebar.getByRole('link', { name: 'Dashboard' }).click();

    // expect: The URL changes to http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Dashboard page is rendered with 'This is your dashboard...'
    await expect(page.getByText('This is your dashboard...')).toBeVisible();
  });
});
