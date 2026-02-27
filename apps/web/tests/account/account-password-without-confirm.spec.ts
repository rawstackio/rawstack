// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account form shows validation error when password is filled but confirm password is empty', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `pwnoconfirm+${Date.now()}@example.com`;
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(throwawayEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('RS', { exact: true })).toBeVisible();

    await page.getByText('RS', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // expect: The account form is displayed
    await expect(page.getByRole('heading', { name: 'Account Settings', exact: true })).toBeVisible();

    // 2. Type 'newpassword123' into the Password field and leave Confirm Password empty
    await page.getByRole('textbox', { name: 'Password Confirm Password' }).fill('newpassword123');

    // expect: The password field has a value, confirm password is empty
    await expect(page.getByRole('textbox', { name: 'Password Confirm Password' })).toHaveValue('newpassword123');

    // 3. Submit the form programmatically to trigger validation
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());

    // expect: A validation error appears below the Confirm Password field
    // Note: When password is filled but confirm is empty, 'Passwords must match' is shown
    // because the match refine runs before the 'Please confirm your password' refine
    await expect(page.getByText('Passwords must match')).toBeVisible();
  });
});
