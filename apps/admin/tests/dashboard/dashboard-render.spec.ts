// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('Dashboard renders correctly when authenticated', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    // expect: The page displays 'This is your dashboard...' as the main heading
    await expect(page.getByRole('heading', { name: 'This is your dashboard...' })).toBeVisible();

    // expect: A subtitle reading 'fill it with widgets, graphs and all the stats about your business!' is visible
    await expect(
      page.getByText('fill it with widgets, graphs and all the stats about your business!'),
    ).toBeVisible();

    // expect: The sidebar is present on the left
    await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

    // expect: The site header with breadcrumb is present at the top
    await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toBeVisible();

    // expect: The breadcrumb shows 'Dashboard > Dashboard'
    await expect(page.getByLabel('breadcrumb').getByRole('link', { name: 'Dashboard', exact: true }).first()).toBeVisible();
    await expect(page.getByLabel('breadcrumb').getByText('Dashboard').first()).toBeVisible();
  });
});
