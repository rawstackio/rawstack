// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Login with invalid credentials shows error toast', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    // expect: The Login form is displayed
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    // 2. Enter a valid email and an incorrect password (8+ characters), then click 'Login'
    await page.getByRole('textbox', { name: 'Email Password' }).fill('admin@rawstack.io');
    await page.getByRole('textbox', { name: '*********' }).fill('wrongpassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: An error toast notification appears with the message 'Something went wrong!'
    await expect(page.getByText('Something went wrong!')).toBeVisible();

    // expect: The user remains on the Login page
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Login form is still visible
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });
});
