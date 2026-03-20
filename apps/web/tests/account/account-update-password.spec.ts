// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Account Page', () => {
  test('Account form allows updating password with valid matching passwords', async ({ page }) => {
    // Register a throwaway user to avoid affecting shared test accounts
    const throwawayEmail = `pwupdate+${Date.now()}@example.com`;
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

    // 2. Leave the Email field with its current value, type 'newpassword123' into the Password field,
    //    and type 'newpassword123' into the Confirm Password field
    await page.getByRole('textbox', { name: 'Password Confirm Password' }).fill('newpassword123');
    await page.getByRole('textbox', { name: 'Password Confirm Password' }).press('Tab');
    await page.locator('input[type="password"]').last().fill('newpassword123');

    // expect: Both password fields accept the input

    // 3. Click the 'Update' button
    await page.getByRole('button', { name: 'Update' }).click();

    // expect: A toast success notification 'Account updated successfully' appears
    await expect(page.getByText('Account updated successfully')).toBeVisible();
  });
});
