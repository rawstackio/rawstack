// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Successful admin login redirects to Dashboard', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    // expect: The Login form is displayed
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

    // 2. Enter a valid admin email and a valid password (at least 8 characters), then click 'Login'
    await page.getByRole('textbox', { name: 'Email Password' }).fill(adminEmail);
    await page.getByRole('textbox', { name: '*********' }).fill(adminPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: The Login button enters a submitting/loading state while the request is in flight
    // (button is disabled during submit due to isSubmitting state)

    // 3. Wait for the login request to complete
    // expect: The user is redirected to the Dashboard page at '/'
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The sidebar, site header, and dashboard content are visible
    await expect(page.getByText('This is your dashboard...')).toBeVisible();

    // expect: No error toast is displayed
    await expect(page.getByText('Something went wrong!')).not.toBeVisible();
  });
});
