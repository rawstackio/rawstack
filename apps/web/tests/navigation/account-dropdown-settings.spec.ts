// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Settings link in account dropdown navigates to account page', async ({ page }) => {
    // 1. Log in and click the RS avatar in the header
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByRole('banner').getByText('RS').click();

    // expect: The dropdown menu is visible with Settings and Logout options
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();

    // 2. Click the 'Settings' link in the dropdown
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The browser navigates to http://localhost:3000/account
    await expect(page).toHaveURL('http://localhost:3000/account');

    // expect: The Account Settings page is displayed
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();
  });
});
