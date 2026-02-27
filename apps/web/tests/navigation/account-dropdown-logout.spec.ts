// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
  test('Logout option in account dropdown logs out the user', async ({ page }) => {
    // 1. Log in and click the RS avatar in the header
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByRole('banner').getByText('RS').click();

    // expect: The dropdown menu is visible
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();

    // 2. Click the 'Logout' option in the dropdown
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // expect: The user is logged out
    // expect: The header reverts to showing the 'Login' button
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // expect: The user's auth data is cleared from localStorage
    await expect(page.getByText('RS', { exact: true })).not.toBeVisible();
  });
});
