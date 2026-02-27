// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Confirming delete account removes the user and logs them out', async ({ page }) => {
    // 1. Register and log in with a test user account, then navigate to /account
    // Register a new throwaway user to delete
    const throwawayEmail = `todelete+${Date.now()}@example.com`;
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(throwawayEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The account page is displayed with the test user's information
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();

    // 2. Click the 'Delete Account' button
    await page.getByRole('button', { name: 'Delete Account' }).click();

    // expect: The confirmation dialog appears
    await expect(page.getByRole('alertdialog', { name: 'Are you sure?' })).toBeVisible();

    // 3. Click the 'Delete Account' button inside the confirmation dialog
    await page.getByRole('alertdialog', { name: 'Are you sure?' }).getByRole('button', { name: 'Delete Account' }).click();

    // expect: A toast success notification 'Account deleted successfully' appears
    await expect(page.getByText('Account deleted successfully')).toBeVisible();

    // expect: The user is logged out
    // expect: The header reverts to showing the 'Login' button instead of the account avatar
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('RS', { exact: true })).not.toBeVisible();
  });
});
