// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login button is disabled when email is invalid format', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Type 'notanemail' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');

    // expect: The text is entered into the Email field
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('notanemail');

    // 3. Type 'password123' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    // expect: The text is entered into the Password field
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('password123');

    // 4. Observe the 'Login' button state
    // expect: The 'Login' button remains disabled because the email is not a valid email address format
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });
});
