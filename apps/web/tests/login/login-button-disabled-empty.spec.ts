// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login button is disabled when form fields are empty', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Observe the 'Login' button state without filling in any fields
    // expect: The 'Login' button is disabled and cannot be clicked
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });
});
