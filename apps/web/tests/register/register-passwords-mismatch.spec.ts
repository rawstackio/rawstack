// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Register form shows error when passwords do not match', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Type 'test@example.com' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@example.com');

    // 3. Type 'password123' into the Password field
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('password123');

    // 4. Type 'differentpassword' into the Confirm Password field
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentpassword');

    // expect: The confirm password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('differentpassword');

    // 5. Click the 'Register' button
    await page.getByRole('button', { name: 'Register' }).click();

    // expect: An inline validation error 'Passwords must match' appears below the Confirm Password field
    await expect(page.getByText('Passwords must match')).toBeVisible();

    // expect: The form is not submitted to the API
    await expect(page).toHaveURL('http://localhost:3000/register');
  });
});
