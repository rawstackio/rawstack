// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('Sidebar can be collapsed and expanded', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user
    await page.goto('http://localhost:5173');

    const sidebarOuter = page.locator('[data-slot="sidebar"]');
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // expect: The sidebar is visible and expanded
    await expect(sidebarOuter).toHaveAttribute('data-state', 'expanded');
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();

    // 2. Click the sidebar toggle button in the site header
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();

    // expect: The sidebar collapses or slides out of view (offcanvas behaviour)
    await expect(sidebarOuter).toHaveAttribute('data-state', 'collapsed');

    // 3. Click the sidebar toggle button again
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();

    // expect: The sidebar expands back to its original state
    await expect(sidebarOuter).toHaveAttribute('data-state', 'expanded');
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();
  });
});
