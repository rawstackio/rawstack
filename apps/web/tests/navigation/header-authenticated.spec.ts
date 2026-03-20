// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Header shows account avatar dropdown when user is authenticated', async ({ page }) => {
    // 1. Log in via the /login page with valid credentials
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: The user is redirected after successful login
    await expect(page).toHaveURL('http://localhost:3000/');

    // 2. Observe the header
    // expect: The 'Login' button is no longer visible
    await expect(page.getByRole('link', { name: 'Login' })).not.toBeVisible();

    // expect: An avatar with initials 'RS' is visible in the header
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    // expect: The account dropdown trigger is present
    await expect(page.getByRole('banner').getByText('RS')).toBeVisible();
  });
});
