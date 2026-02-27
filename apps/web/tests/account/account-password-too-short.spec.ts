// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account form shows validation error when password is less than 8 characters', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `pwtoshort+${Date.now()}@example.com`;
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

    // 2. Type '1234567' (7 characters) into the Password field
    await page.getByRole('textbox', { name: 'Password Confirm Password' }).fill('1234567');

    // expect: The password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password Confirm Password' })).toHaveValue('1234567');

    // 3. Type '1234567' into the Confirm Password field and submit
    await page.locator('input[type="password"]').last().fill('1234567');
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());

    // expect: A validation error 'Password must be at least 8 characters' appears
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();

    // expect: The form is not submitted
    await expect(page).toHaveURL('http://localhost:3000/account');
  });
});
