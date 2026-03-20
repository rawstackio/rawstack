// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Login link on register page navigates to login page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The registration page is displayed
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // 2. Click the 'Login' link at the bottom of the form
    await page.getByRole('link', { name: 'Login' }).click();

    // expect: The browser navigates to http://localhost:3000/login
    await expect(page).toHaveURL('http://localhost:3000/login');

    // expect: The 'Login to your account' heading is visible
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
  });
});
