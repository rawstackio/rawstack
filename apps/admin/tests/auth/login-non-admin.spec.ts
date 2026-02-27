// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Login with a non-admin account is rejected', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    // expect: The Login form is displayed
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    // 2. Enter the credentials of a user who exists but does not have the admin role, then click 'Login'
    const nonAdminEmail = process.env.NON_ADMIN_EMAIL ?? 'user@rawstack.io';
    const nonAdminPassword = process.env.NON_ADMIN_PASSWORD ?? 'password123';

    await page.getByRole('textbox', { name: 'Email Password' }).fill(nonAdminEmail);
    await page.getByRole('textbox', { name: '*********' }).fill(nonAdminPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: An error toast notification appears with the message 'Something went wrong!'
    await expect(page.getByText('Something went wrong!')).toBeVisible();

    // expect: The user remains on the Login page and is not authenticated
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });
});
