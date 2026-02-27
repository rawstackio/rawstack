// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account form shows error when updating email to one already in use', async ({ page }) => {
    // 1. Log in and navigate to http://localhost:3000/account
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password1');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The account form is displayed with the current user's email
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('user@test.com');

    // 2. Clear the Email field and type an email address already registered to a different user
    await page.getByRole('textbox', { name: 'Email' }).clear();
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');

    // expect: The email field accepts the input
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('admin@test.com');

    // 3. Click the 'Update' button
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: An inline validation error 'A user with this email already exists' appears below the Email field
    await expect(page.getByText('A user with this email already exists')).toBeVisible();
  });
});
