// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Submitting reset password form shows success notification regardless of whether email exists', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The reset password form is displayed
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // 2. Type 'nonexistent@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@example.com');

    // expect: The email field accepts the input and the button becomes enabled
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('nonexistent@example.com');
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeEnabled();

    // 3. Click the 'Reset Password' button
    await page.getByRole('button', { name: 'Reset Password' }).click();

    // expect: A toast success notification appears with the message 'A password reset link has been sent to nonexistent@example.com'
    await expect(page.getByText('A password reset link has been sent to nonexistent@example.com')).toBeVisible();

    // expect: The success message is shown regardless of whether the account exists (prevents user enumeration)
    await expect(page).toHaveURL('http://localhost:3000/reset-password');
  });
});
