// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Update Password button is disabled when fields are empty', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password
    await page.goto('http://localhost:3000/set-password');

    // expect: The set password form is displayed
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).toBeVisible();

    // 2. Observe the 'Update Password' button without filling in any fields
    // expect: The 'Update Password' button is disabled and cannot be clicked
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeDisabled();
  });
});
