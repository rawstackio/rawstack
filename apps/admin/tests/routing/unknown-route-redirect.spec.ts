// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Protected Routes - Unauthenticated Access', () => {
  test('Unknown routes redirect to root', async ({ page }) => {
    // 1. With no stored auth state, navigate to http://localhost:5173/some-nonexistent-path
    // Note: this step uses the default (unauthenticated) storage state override
    await page.goto('http://localhost:5173');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/some-nonexistent-path');

    // expect: The browser URL becomes http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Login page is displayed
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();

    // 2. Log in as an admin user, then navigate to http://localhost:5173/some-nonexistent-path
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

    await page.getByRole('textbox', { name: 'Email Password' }).fill(adminEmail);
    await page.getByRole('textbox', { name: '*********' }).fill(adminPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('This is your dashboard...')).toBeVisible();

    await page.goto('http://localhost:5173/some-nonexistent-path');

    // expect: The browser URL becomes http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Dashboard page is displayed
    await expect(page.getByText('This is your dashboard...')).toBeVisible();
  });
});
