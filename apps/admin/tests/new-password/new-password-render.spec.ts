// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('New Password Page', () => {
  test('New password page renders correctly when authenticated', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    await page.goto('http://localhost:5173/new-password');

    // expect: The page heading reads 'Reset Your Password'
    await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toBeVisible();

    // expect: A password input with placeholder 'new password' is visible
    await expect(page.locator('input[placeholder="new password"]')).toBeVisible();

    // expect: A confirm password input with placeholder 'confirm password' is visible
    await expect(page.locator('input[placeholder="confirm password"]')).toBeVisible();

    // expect: An 'Update Password' button is present and disabled initially
    const updateBtn = page.getByRole('button', { name: 'Update Password' });
    await expect(updateBtn).toBeVisible();
    await expect(updateBtn).toBeDisabled();

    // expect: The sidebar and site header layout is rendered around the form
    await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toBeVisible();
  });
});
