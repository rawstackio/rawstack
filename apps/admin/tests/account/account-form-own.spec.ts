// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Account Form (Edit Own Account)', () => {
  test('Account form displays current user details when editing own account', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 as an authenticated admin user and open the Account drawer via the user menu
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();

    // expect: The drawer title reads 'Edit Your Account'
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // expect: A read-only 'Id' field is populated with the current user's UUID
    const idInput = page.locator('input[readonly]');
    await expect(idInput).toBeVisible();
    await expect(idInput).not.toHaveValue('');

    // expect: A clipboard copy button is present next to the Id field
    await expect(page.getByRole('button', { name: /clipboard/i })).toBeVisible();

    // expect: The Email field is populated with the current user's email address
    await expect(page.locator('input[placeholder="email"]')).toHaveValue(adminEmail);

    // expect: The Admin toggle switch is present but disabled (cannot remove own admin role)
    const adminToggle = page.locator('#admin-role');
    await expect(adminToggle).toBeVisible();
    await expect(adminToggle).toBeDisabled();

    // expect: An 'Update Password' toggle switch is visible
    await expect(page.locator('#password-update')).toBeVisible();

    // expect: The password fields are initially disabled
    await expect(page.locator('input[placeholder="new password"]')).toBeDisabled();
    await expect(page.locator('input[placeholder="confirm password"]')).toBeDisabled();

    // expect: An 'Update' button and a 'Delete' button are present
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
