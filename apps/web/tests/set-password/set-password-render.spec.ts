// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Set Password Page', () => {
  test('Set password page renders correctly with all expected elements', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/set-password
    await page.goto('http://localhost:3000/set-password');

    // expect: The heading 'Set Your Password' is visible
    await expect(page.getByRole('heading', { name: 'Set Your Password' })).toBeVisible();

    // expect: The subheading 'Create your new password' is visible
    await expect(page.getByRole('heading', { name: 'Create your new password' })).toBeVisible();

    // expect: A 'New Password' input field is present with placeholder 'Enter new password'
    await expect(page.getByRole('textbox', { name: 'New Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'New Password' })).toHaveAttribute('placeholder', 'Enter new password');

    // expect: A 'Confirm Password' input field is present with placeholder 'Confirm new password'
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveAttribute('placeholder', 'Confirm new password');

    // expect: An 'Update Password' button is present and initially disabled
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Password' })).toBeDisabled();

    // expect: The standard site header with Login button and theme toggle is visible
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });
});
