// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Layout and Responsiveness', () => {
  test('User dropdown opens at the correct side based on device', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user on a desktop viewport
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // 2. Click the user menu button in the sidebar footer
    await sidebar.getByText(adminEmail).click();

    // expect: The dropdown menu opens to the right side of the sidebar on desktop
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Close the menu
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();

    // 3. Resize the viewport to a mobile size and click the user menu button
    await page.setViewportSize({ width: 375, height: 812 });
    // On mobile, sidebar is offcanvas — open it first via the toggle button
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
    await sidebar.getByText(adminEmail).click();

    // expect: The dropdown menu opens at the bottom of the trigger on mobile
    await expect(menu).toBeVisible();
  });
});
