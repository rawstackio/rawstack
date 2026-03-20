// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Cancelling the delete account dialog keeps the user on the account page', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `canceldelete+${Date.now()}@example.com`;
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(throwawayEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The account page is displayed
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();

    // 2. Click the 'Delete Account' button to open the confirmation dialog
    await page.getByRole('button', { name: 'Delete Account' }).click();

    // expect: The confirmation dialog is visible
    await expect(page.getByRole('alertdialog', { name: 'Are you sure?' })).toBeVisible();

    // 3. Click the 'Cancel' button in the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();

    // expect: The dialog closes
    await expect(page.getByRole('alertdialog', { name: 'Are you sure?' })).not.toBeVisible();

    // expect: The user remains on the /account page
    await expect(page).toHaveURL('http://localhost:3000/account');

    // expect: The user account has not been deleted
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();
  });
});
