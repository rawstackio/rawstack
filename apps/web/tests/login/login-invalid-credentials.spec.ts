// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login with invalid credentials shows error toast notification', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Type 'test@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');

    // 3. Type 'wrongpassword' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('wrongpassword');

    // 4. Click the 'Login' button
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: A toast error notification appears with the message 'Login failed. Please check your credentials.'
    await expect(page.getByText('Login failed. Please check your credentials.')).toBeVisible();

    // expect: The user remains on the /login page
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});
