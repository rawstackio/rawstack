// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Set password shows error for mismatched passwords', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password
    await page.goto('http://localhost:3000/set-password');

    // expect: The set password form is displayed
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).toBeVisible();

    // 2. Type 'newpassword123' into the 'New Password' field
    await page.getByRole('textbox', { name: 'New Password' }).fill('newpassword123');

    // expect: The field accepts the input
    await expect(page.getByRole('textbox', { name: 'New Password' })).toHaveValue('newpassword123');

    // 3. Type 'differentpassword123' into the 'Confirm Password' field
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentpassword123');

    // expect: The field accepts the input
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('differentpassword123');

    // 4. Observe the button state or attempt to submit
    // expect: The 'Update Password' button remains disabled
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeDisabled();
  });
});
