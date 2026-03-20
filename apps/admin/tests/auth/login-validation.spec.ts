// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Login field validation errors are shown inline', async ({ page }) => {
    // 1. Navigate to http://localhost:5173 with no stored auth state
    await page.goto('http://localhost:5173');

    const emailInput = page.getByRole('textbox', { name: 'Email Password' });
    const passwordInput = page.getByRole('textbox', { name: '*********' });

    // 2. Type an invalid string into the Email field and tab away
    await emailInput.fill('notanemail');
    await page.keyboard.press('Tab');

    // expect: An inline error message reading 'Invalid email address' appears beneath the Email field
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // 3. Clear the Email field and tab away
    await emailInput.clear();
    await page.keyboard.press('Tab');

    // expect: An inline error message reading 'Email is required' appears beneath the Email field
    await expect(page.getByText('Email is required')).toBeVisible();

    // 4. Type a valid email, then type fewer than 8 characters into the Password field and tab away
    await emailInput.fill('admin@rawstack.io');
    await passwordInput.fill('short');
    await page.keyboard.press('Tab');

    // expect: An inline error message reading 'Password must be at least 8 characters' appears beneath the Password field
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });
});
