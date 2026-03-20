// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Register form shows error for invalid email format', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Type 'notanemail' into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');

    // expect: The text is entered
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('notanemail');

    // 3. Type 'password123' into the Password field and 'password123' into the Confirm Password field
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');

    // expect: The fields accept the input
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('password123');
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveValue('password123');

    // 4. Submit the form bypassing HTML5 email validation to trigger react-hook-form validation
    // HTML5 type="email" validation would block form submission, so we use requestSubmit with noValidate
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
      form.requestSubmit();
    });

    // expect: An inline validation error 'Invalid email address' appears below the Email field
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // expect: The form is not submitted to the API
    await expect(page).toHaveURL('http://localhost:3000/register');
  });
});
