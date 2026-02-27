// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Verification Page', () => {
  test('Email verification page shows success message for a valid token', async ({ page }) => {
    // 1. Obtain a valid email verification token by intercepting the API response with a mocked success
    // Mock the API to return a successful verification response for testing purposes
    await page.route('**/auth/action-requests**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // 2. Navigate to http://localhost:3000/email-verification?token=<valid-token>
    await page.goto('http://localhost:3000/email-verification?token=mocked-valid-token');

    // expect: The page loads and shows a loading state
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // 3. Wait for the verification API call to complete
    // expect: A success message 'Success! your email has been verified' is displayed along with a thumbs up icon
    await expect(page.getByText('Success! your email has been verified')).toBeVisible();

    // expect: No error message is shown
    await expect(page.getByText('Error!')).not.toBeVisible();
  });
});
