// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Password field masks input characters', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Type 'mysecretpassword' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('mysecretpassword');

    // expect: The password input field is of type 'password', meaning characters are masked and not displayed in plain text
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toHaveAttribute('type', 'password');
  });
});
