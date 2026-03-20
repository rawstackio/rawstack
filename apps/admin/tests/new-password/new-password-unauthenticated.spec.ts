// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('New Password Page', () => {
  test('New password page is accessible only when authenticated', async ({ page }) => {
    // 1. With no stored auth state, navigate directly to http://localhost:5173/new-password
    await page.goto('http://localhost:5173/new-password');

    // expect: The URL changes to http://localhost:5173/
    await expect(page).toHaveURL('http://localhost:5173/');

    // expect: The Login page is shown and the New Password form is not accessible
    await expect(page.getByRole('textbox', { name: 'Email Password' })).toBeVisible();
    await expect(page.getByText('Reset Your Password')).not.toBeVisible();
  });
});
