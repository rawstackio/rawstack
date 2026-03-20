// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('Reset password page renders correctly with all expected elements', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The heading 'Reset your password' is visible
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // expect: An Email input field is present with placeholder 'hi@rawstack.io'
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('placeholder', 'hi@rawstack.io');

    // expect: A 'Reset Password' button is present and initially disabled
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeDisabled();

    // expect: A 'Login' link is visible linking to /login
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });
});
