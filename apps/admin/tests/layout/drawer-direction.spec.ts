// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Layout and Responsiveness', () => {
  test('Account/user drawer opens from the right on desktop and from the bottom on mobile', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user on a desktop viewport and click 'Add User'
    await page.goto('http://localhost:5173/users');
    await expect(page.getByRole('table')).toBeVisible();

    await page.getByRole('button', { name: 'Add User' }).click();

    // expect: The drawer slides in from the right side of the screen
    const drawer = page.getByText('Create Account');
    await expect(drawer).toBeVisible();

    // 2. Close the drawer, resize the viewport to a mobile size, and click 'Add User'
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).not.toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Add User' }).click();

    // expect: The drawer slides up from the bottom of the screen
    await expect(page.getByText('Create Account')).toBeVisible();
  });
});
