// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Register form shows error when password is shorter than 6 characters', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Type 'test@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');

    // 3. Type '12345' (5 characters) into the Password field
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('12345');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('12345');

    // 4. Type '12345' into the Confirm Password field and click 'Register'
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('12345');
    await page.getByRole('button', { name: 'Register' }).click();

    // expect: An inline validation error 'Password must be at least 6 characters' appears below the Password field
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });
});
