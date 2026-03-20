// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Successful registration logs in the user and redirects', async ({ page }) => {
    const uniqueEmail = `newuser+${Date.now()}@example.com`;

    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Type a unique, valid email address into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue(uniqueEmail);

    // 3. Type 'password123' into the Password field
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('password123');

    // 4. Type 'password123' into the Confirm Password field
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    // expect: The confirm password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('password123');

    // 5. Click the 'Register' button
    await page.getByRole('button', { name: 'Register' }).click();

    // expect: The user is registered and logged in
    // expect: The user is redirected away from the registration page
    await expect(page).not.toHaveURL('http://localhost:3000/register');

    // expect: The header now shows the account avatar/dropdown instead of the Login button
    await expect(page.getByText('RS', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).not.toBeVisible();
  });
});
