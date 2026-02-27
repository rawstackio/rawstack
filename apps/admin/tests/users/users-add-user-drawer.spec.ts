// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Add User button opens the Create Account drawer', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user
    await page.goto('http://localhost:5173/users');

    // expect: The 'Add User' button is visible in the top-right of the table toolbar
    const addUserBtn = page.getByRole('button', { name: 'Add User' });
    await expect(addUserBtn).toBeVisible();

    // 2. Click the 'Add User' button
    await addUserBtn.click();

    // expect: A slide-in drawer opens
    // expect: The drawer title reads 'Create Account'
    await expect(page.getByText('Create Account')).toBeVisible();

    // expect: The Account form is displayed with only an Email field and a 'Create User' button
    await expect(page.locator('input[placeholder="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create User' })).toBeVisible();

    // expect: No Id field (read-only input is only present when editing)
    await expect(page.locator('input[readonly]')).not.toBeVisible();
  });
});
