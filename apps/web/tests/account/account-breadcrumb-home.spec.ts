// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account page breadcrumb Home link navigates to home page', async ({ page }) => {
    // 1. Log in and navigate to http://localhost:3000/account
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The account page is displayed with breadcrumb navigation
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();

    // 2. Click the 'Home' link in the breadcrumb navigation
    await page.getByRole('link', { name: 'Home' }).click();

    // expect: The browser navigates to http://localhost:3000/
    await expect(page).toHaveURL('http://localhost:3000/');

    // expect: The home page hero content is visible
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();
  });
});
