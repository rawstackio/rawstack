// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account form allows updating email with valid new address', async ({ page }) => {
    // Register a throwaway user to avoid permanently modifying shared test accounts
    const throwawayEmail = `emailupdate+${Date.now()}@example.com`;
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

    // 2. Clear the Email field and type a new unique valid email address
    const newEmail = `updated+${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Email' }).clear();
    await page.getByRole('textbox', { name: 'Email' }).fill(newEmail);

    // expect: The email field accepts the new email
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue(newEmail);

    // 3. Leave the Password and Confirm Password fields empty, then click 'Update'
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: A toast success notification 'Account updated successfully' appears
    await expect(page.getByText('Account updated successfully')).toBeVisible();

    // expect: The unverified email banner becomes visible indicating the new email needs verification
    await expect(page.getByText('Your email address is unverified')).toBeVisible();
  });
});
