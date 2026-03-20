// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Sign up link on login page navigates to register page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login page is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Click the 'Sign up' link
    await page.getByRole('link', { name: 'Sign up' }).click();

    // expect: The browser navigates to http://localhost:3000/register
    await expect(page).toHaveURL('http://localhost:3000/register');

    // expect: The 'Create an Account' heading is visible
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
  });
});
