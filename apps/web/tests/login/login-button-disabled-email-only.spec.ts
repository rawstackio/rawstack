// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login button is disabled when only email is filled', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Type 'test@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

    // expect: The text is entered into the Email field
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');

    // 3. Leave the Password field empty and observe the button state
    // expect: The 'Login' button remains disabled because password is required
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });
});
