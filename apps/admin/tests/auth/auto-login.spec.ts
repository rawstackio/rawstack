// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', () => {
  test('Auto-login via URL token and email parameters', async ({ page }) => {
    // This test requires a valid password reset token from the API.
    // Set VALID_PASSWORD_TOKEN env var with a real token to run this test.
    test.fixme(
      !process.env.VALID_PASSWORD_TOKEN,
      'Requires a valid VALID_PASSWORD_TOKEN env var — obtain one via the password reset API',
    );

    // 1. Navigate with password-token and email query params
    const validToken = process.env.VALID_PASSWORD_TOKEN!;
    const email = process.env.ADMIN_EMAIL ?? 'admin@test.com';

    await page.goto(`http://localhost:5173/?password-token=${validToken}&email=${encodeURIComponent(email)}`);

    // 2. Wait for the auto-login request to complete successfully
    // expect: A success toast appears with the message 'Auto login successful!'
    await expect(page.getByText('Auto login successful!')).toBeVisible();

    // expect: The user is automatically redirected to the '/new-password' page
    await expect(page).toHaveURL('http://localhost:5173/new-password');
  });
});
