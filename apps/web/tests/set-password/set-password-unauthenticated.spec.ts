// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Set password fails with error when user is not authenticated', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password in a fresh browser session (no auth data in localStorage)
    await page.goto('http://localhost:3000/set-password');

    // expect: The set password form is displayed
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).toBeVisible();

    // 2. Type 'newpassword123' into the 'New Password' field
    await page.getByRole('textbox', { name: 'New Password' }).fill('newpassword123');

    // expect: The field accepts the input
    await expect(page.getByRole('textbox', { name: 'New Password' })).toHaveValue('newpassword123');

    // 3. Type 'newpassword123' into the 'Confirm Password' field
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('newpassword123');

    // expect: The field accepts the input and the button becomes enabled
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('newpassword123');
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeEnabled();

    // 4. Click the 'Update Password' button
    await page.getByRole('button', { name: 'Update Password' }).click();

    // expect: A toast error notification appears with the message 'User not authenticated'
    await expect(page.getByText('User not authenticated')).toBeVisible();

    // expect: The user is not redirected
    await expect(page).toHaveURL('http://localhost:3000/set-password');
  });
});
