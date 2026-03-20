// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('New Password Page', () => {
  test('Failed password update shows error toast', async ({ page }) => {
    // 1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    await page.goto('http://localhost:5173/new-password');

    // 2. Enter matching passwords and click 'Update Password', while the API is configured to return an error
    // Intercept the API call to force a failure response
    await page.route('**/users/**', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) });
    });

    await page.locator('input[placeholder="new password"]').fill('newpassword123');
    await page.locator('input[placeholder="confirm password"]').fill('newpassword123');
    await page.getByRole('button', { name: 'Update Password' }).click();

    // expect: An error toast appears with the message 'Oops! Something went wrong'
    await expect(page.getByText('Oops! Something went wrong')).toBeVisible();

    // expect: The user remains on the /new-password page
    await expect(page).toHaveURL('http://localhost:5173/new-password');
  });
});
