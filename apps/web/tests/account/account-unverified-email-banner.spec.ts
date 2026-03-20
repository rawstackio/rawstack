// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Unverified email banner is visible when user has an unverified email', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `unverified+${Date.now()}@example.com`;
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(throwawayEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();

    // Update email to trigger unverified state
    const unverifiedEmail = `newemail+${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Email' }).clear();
    await page.getByRole('textbox', { name: 'Email' }).fill(unverifiedEmail);
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Account updated successfully')).toBeVisible();

    // expect: A yellow warning banner is displayed with the text about unverified email
    await expect(page.getByText('Your email address is unverified')).toBeVisible();

    // expect: A 'Resend email' button is present in the banner
    await expect(page.getByRole('button', { name: 'Resend email' })).toBeVisible();

    // 2. Click the 'Resend email' button
    await page.getByRole('button', { name: 'Resend email' }).click();

    // expect: A toast success notification 'Verification email sent' appears
    await expect(page.getByText('Verification email sent')).toBeVisible();
  });
});
