// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account page is accessible and renders correctly for authenticated users', async ({ page }) => {
    // 1. Log in with valid credentials by navigating to /login and submitting the login form
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();

    // expect: The user is logged in and the header shows the account avatar
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    // 2. Navigate to http://localhost:3000/account via SPA navigation (dropdown)
    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The page renders with the heading 'Account Settings'
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();

    // expect: The subheading 'Manage your account settings and set e-mail preferences.' is visible
    await expect(page.getByRole('heading', { name: 'Manage your account settings and set e-mail preferences.' })).toBeVisible();

    // expect: A breadcrumb navigation shows 'Home > Account'
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

    // expect: An email input field is pre-populated with the user's current email address
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('user@test.com');

    // expect: A password input field is present (empty)
    await expect(page.getByRole('textbox', { name: 'Password Confirm Password' })).toBeVisible();

    // expect: An 'Update' button is visible
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();

    // expect: A 'Delete Account' button is visible
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
  });
});
