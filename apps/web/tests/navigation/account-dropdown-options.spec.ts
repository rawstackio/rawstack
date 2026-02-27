// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Account avatar dropdown menu shows Settings and Logout options', async ({ page }) => {
    // 1. Log in and navigate to the home page
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: The header shows the authenticated state with the RS avatar
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    // 2. Click the RS avatar in the header
    await page.getByRole('banner').getByText('RS').click();

    // expect: A dropdown menu appears with two items: 'Settings' and 'Logout'
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
  });
});
