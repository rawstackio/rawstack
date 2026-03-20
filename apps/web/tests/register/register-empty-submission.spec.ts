// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Register form shows validation errors when submitted empty', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration form is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Click the 'Register' button without filling in any fields
    await page.getByRole('button', { name: 'Register' }).click();

    // expect: An inline validation error 'Invalid email address' appears below the Email field
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // expect: An inline validation error 'Password must be at least 6 characters' appears below the Password field
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();

    // expect: An inline validation error 'Confirm Password is required' appears below the Confirm Password field
    await expect(page.getByText('Confirm Password is required')).toBeVisible();
  });
});
