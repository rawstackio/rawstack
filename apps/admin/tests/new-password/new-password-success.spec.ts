// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('New Password Page', () => {
  test('Successful password update shows toast and redirects to Dashboard', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    await page.goto('http://localhost:5173/new-password');

    // 2. Enter a valid new password in both fields (at least 8 characters, matching) and click 'Update Password'
    const newPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
    await page.locator('input[placeholder="new password"]').fill(newPassword);
    await page.locator('input[placeholder="confirm password"]').fill(newPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();

    // expect: A success toast appears with the message 'Your password has been updated'
    await expect(page.getByText('Your password has been updated')).toBeVisible();

    // expect: The user is redirected to the Dashboard at http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText('This is your dashboard...')).toBeVisible();
  });
});
