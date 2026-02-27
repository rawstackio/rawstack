// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Auth pages (login, register, reset-password) use the auth header layout without theme toggle', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The header shows the RawStack logo
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // expect: No 'Toggle theme' button is present in this header
    await expect(page.getByRole('button', { name: 'Toggle theme' })).not.toBeVisible();

    // expect: No 'Login' button is shown in the header (it is on the main page content instead)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Login' })).not.toBeVisible();

    // 2. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The same minimal auth header layout is used without the theme toggle
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).not.toBeVisible();

    // 3. Navigate to http://localhost:3000/reset-password
    await page.goto('http://localhost:3000/reset-password');

    // expect: The same minimal auth header layout is used
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).not.toBeVisible();
  });
});
