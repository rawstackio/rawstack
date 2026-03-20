// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Login button is disabled until form is valid', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    const loginButton = page.getByRole('button', { name: 'Login' });
    const emailInput = page.getByRole('textbox', { name: 'Email Password' });
    const passwordInput = page.getByRole('textbox', { name: '*********' });

    // expect: The 'Login' button is disabled
    await expect(loginButton).toBeDisabled();

    // 2. Type a valid email address into the Email field
    await emailInput.fill('admin@rawstack.io');

    // expect: The 'Login' button remains disabled because the password field is still empty
    await expect(loginButton).toBeDisabled();

    // 3. Type fewer than 8 characters into the Password field
    await passwordInput.fill('short');

    // expect: The 'Login' button remains disabled due to failing the minimum length validation
    await expect(loginButton).toBeDisabled();

    // 4. Type 8 or more characters into the Password field
    await passwordInput.fill('password123');

    // expect: The 'Login' button becomes enabled
    await expect(loginButton).toBeEnabled();
  });
});
