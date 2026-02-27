// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Users Management Page', () => {
  test('Create new user from Add User drawer', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user and click 'Add User'
    await page.goto('http://localhost:5173/users');
    await page.getByRole('button', { name: 'Add User' }).click();

    // expect: The Create Account drawer is open
    await expect(page.getByText('Create Account')).toBeVisible();

    const emailInput = page.locator('input[placeholder="email"]');
    const createBtn = page.getByRole('button', { name: 'Create User' });

    // 2. Leave the email field empty and attempt to submit
    // expect: The 'Create User' button is disabled and cannot be submitted
    await expect(createBtn).toBeDisabled();

    // 3. Type an invalid email string and observe
    await emailInput.fill('invalidemail');
    await page.keyboard.press('Tab');

    // expect: An inline validation error appears for the email field
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // expect: The 'Create User' button remains disabled
    await expect(createBtn).toBeDisabled();

    // 4. Enter a valid, unique email address and click 'Create User'
    const uniqueEmail = `testuser-${Date.now()}@rawstack.io`;
    await emailInput.clear();
    await emailInput.fill(uniqueEmail);
    await createBtn.click();

    // expect: A success toast appears with the message 'User created successfully'
    await expect(page.getByText('User created successfully')).toBeVisible();

    // expect: The drawer remains open
    await expect(page.getByText('Create Account')).toBeVisible();
  });
});
