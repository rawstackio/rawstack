// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Protected Routes - Unauthenticated Access', () => {
  test('Unauthenticated access to /users redirects to login page', async ({ page }) => {
    // 1. With no stored auth state, navigate directly to http://localhost:5173/users
    await page.goto('http://localhost:5173/users');

    // expect: The browser URL becomes http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Login page is displayed with the Email and Password fields
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '*********' })).toBeVisible();

    // expect: The Users page content ('Rawstack Users') is not shown
    await expect(page.getByText('Rawstack Users')).not.toBeVisible();
  });
});
