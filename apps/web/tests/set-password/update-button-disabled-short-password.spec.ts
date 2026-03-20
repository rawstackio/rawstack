// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Update Password button is disabled when password is less than 8 characters', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password
    await page.goto('http://localhost:3000/set-password');

    // expect: The set password form is displayed
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).toBeVisible();

    // 2. Type '1234567' (7 characters) into the 'New Password' field
    await page.getByRole('textbox', { name: 'New Password' }).fill('1234567');

    // expect: The field accepts the input
    await expect(page.getByRole('textbox', { name: 'New Password' })).toHaveValue('1234567');

    // 3. Type '1234567' into the 'Confirm Password' field
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('1234567');

    // expect: The field accepts the input
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('1234567');

    // 4. Observe the 'Update Password' button state
    // expect: The 'Update Password' button remains disabled
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeDisabled();
  });
});
