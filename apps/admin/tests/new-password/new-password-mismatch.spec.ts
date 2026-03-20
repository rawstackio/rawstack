// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('New Password Page', () => {
  test('Passwords not matching shows validation error and disables submit', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    await page.goto('http://localhost:5173/new-password');

    const updateBtn = page.getByRole('button', { name: 'Update Password' });
    const passwordField = page.locator('input[placeholder="new password"]');
    const confirmField = page.locator('input[placeholder="confirm password"]');

    // 2. Type a valid password (8+ characters) in the first field and a different value in the confirm field
    await passwordField.fill('newpassword123');
    await confirmField.fill('differentpassword');
    await page.keyboard.press('Tab');

    // expect: An inline error 'Passwords must match' appears beneath the confirm password field
    await expect(page.getByText('Passwords must match')).toBeVisible();

    // expect: The 'Update Password' button is disabled
    await expect(updateBtn).toBeDisabled();
  });
});
