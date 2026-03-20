// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Login page renders correctly when unauthenticated', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    // expect: The page title is 'Rawstack admin dashboard'
    await expect(page).toHaveTitle('Rawstack admin dashboard');

    // expect: The RawStack logo and 'Admin Dashboard' heading are visible
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Dashboard', level: 1 })).toBeVisible();

    // expect: An Email input with placeholder 'hi@rawstack.io' is present
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    // expect: A Password input with placeholder '*********' is present
    await expect(page.getByRole('textbox', { name: '*********' })).toBeVisible();

    // expect: A 'Login' button is present and is disabled
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeDisabled();

    // expect: A 'Forgot Password' ghost button is present
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });
});
