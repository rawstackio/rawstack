// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login button becomes enabled when valid email and password are entered', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed with the Login button disabled
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();

    // 2. Type 'test@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');

    // 3. Type 'password123' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('password123');

    // 4. Observe the 'Login' button state
    // expect: The 'Login' button is now enabled and clickable
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  });
});
