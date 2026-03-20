// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Verification Page', () => {
  test('Email verification page shows error for an invalid token', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/email-verification?token=invalid-token-12345
    await page.goto('http://localhost:3000/email-verification?token=invalid-token-12345');

    // expect: The RawStack logo is visible in the header
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // 2. Wait for the verification API call to complete
    // expect: The loading indicator disappears
    // expect: An error message 'Error! Invalid token' is displayed along with an alert triangle icon
    await expect(page.getByText('Error! Invalid token')).toBeVisible();

    // expect: No success message is shown
    await expect(page.getByText('Success!')).not.toBeVisible();
  });
});
