// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Layout and Responsiveness', () => {
  test('Sidebar is collapsible via offcanvas behaviour', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user on a desktop viewport
    await page.goto('http://localhost:5173');

    const sidebarOuter = page.locator('[data-slot="sidebar"]');
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // expect: The sidebar is fully expanded and all navigation items are visible with labels
    await expect(sidebarOuter).toHaveAttribute('data-state', 'expanded');
    await expect(sidebar.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();

    // 2. Click the sidebar trigger/toggle button in the header
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();

    // expect: The sidebar slides off-canvas (data-state changes to collapsed)
    await expect(sidebarOuter).toHaveAttribute('data-state', 'collapsed');

    // 3. Click the sidebar trigger again
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();

    // expect: The sidebar slides back into view
    await expect(sidebarOuter).toHaveAttribute('data-state', 'expanded');
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();
  });
});
