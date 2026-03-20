// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Delete Account button triggers confirmation dialog', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `deletedialog+${Date.now()}@example.com`;
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

    // 2. Click the 'Delete Account' button
    await page.getByRole('button', { name: 'Delete Account' }).click();

    // expect: A modal alert dialog appears with the title 'Are you sure?'
    await expect(page.getByRole('alertdialog', { name: 'Are you sure?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible();

    // expect: The dialog contains the warning text
    await expect(page.getByText('This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.')).toBeVisible();

    // expect: A 'Cancel' button is visible in the dialog
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // expect: A 'Delete Account' confirmation button is visible in the dialog
    const deleteButtons = page.getByRole('button', { name: 'Delete Account' });
    await expect(deleteButtons.last()).toBeVisible();
  });
});
