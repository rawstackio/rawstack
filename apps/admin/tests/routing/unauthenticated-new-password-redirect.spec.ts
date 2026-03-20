// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Protected Routes - Unauthenticated Access', () => {
  test('Unauthenticated access to /new-password redirects to login page', async ({ page }) => {
    // 1. With no stored auth state, navigate directly to http://localhost:5173/new-password
    await page.goto('http://localhost:5173/new-password');

    // expect: The browser URL becomes http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Login page is displayed
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    // expect: The 'Reset Your Password' form is not shown
    await expect(page.getByText('Reset Your Password')).not.toBeVisible();
  });
});
