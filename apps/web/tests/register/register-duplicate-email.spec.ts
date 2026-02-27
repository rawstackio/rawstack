// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Register form shows error when attempting to register with an existing email', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Type an email address that already exists in the system into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('user@test.com');

    // 3. Type 'password123' into the Password field and 'password123' into the Confirm Password field
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    // expect: Both fields accept the input
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('password123');
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('password123');

    // 4. Click the 'Register' button
    await page.getByRole('button', { name: 'Register' }).click();

    // expect: An inline validation error 'A user with this email already exists' appears below the Email field
    await expect(page.getByText('A user with this email already exists')).toBeVisible();

    // expect: The user is not logged in or redirected
    await expect(page).toHaveURL('http://localhost:3000/register');
  });
});
