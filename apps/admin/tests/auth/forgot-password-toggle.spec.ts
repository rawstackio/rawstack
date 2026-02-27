// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Forgot Password button toggles to password reset form', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    // expect: The Login form is shown with 'Login' button and 'Forgot Password' ghost button
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();

    // 2. Click the 'Forgot Password' button
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    // expect: The password reset request form is displayed
    // expect: An Email input is present
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

    // expect: A 'Reset Password' button is present and disabled
    const resetButton = page.getByRole('button', { name: 'Reset Password' });
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeDisabled();

    // expect: A 'Login' ghost button is present
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // expect: The Login form (with the Password field) is no longer visible
    await expect(page.getByRole('textbox', { name: '*********' })).not.toBeVisible();

    // 3. Click the 'Login' button
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: The standard Login form is restored with both Email and Password fields visible
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '*********' })).toBeVisible();

    // expect: The 'Forgot Password' button is shown again
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });
});
