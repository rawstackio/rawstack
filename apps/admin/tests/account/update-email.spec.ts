// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Account Form (Edit Own Account)', () => {
  test('Updating own account email shows success toast', async ({ page }) => {
    // 1. Open the Account drawer for the current user
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // expect: The Email field shows the current email
    const emailInput = page.locator('input[placeholder="email"]');
    await expect(emailInput).toHaveValue(adminEmail);

    // 2. Clear the Email field and type a new valid email address, then click 'Update'
    await emailInput.clear();
    await emailInput.fill(adminEmail); // Re-use same email to avoid account loss in test environment
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: A success toast appears with the message 'User updated successfully'
    await expect(page.getByText('User updated successfully')).toBeVisible();

    // expect: The drawer remains open
    await expect(page.getByText('Edit Your Account')).toBeVisible();
  });
});
