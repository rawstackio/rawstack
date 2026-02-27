// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Verification Page', () => {
  test('Email verification page shows error when token query param is absent', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/email-verification (without any token query parameter)
    await page.goto('http://localhost:3000/email-verification');

    // expect: The page loads and makes an API call
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // 2. Wait for the verification process to complete
    // expect: An error message 'Error! Invalid token' is displayed
    await expect(page.getByText('Error! Invalid token')).toBeVisible();

    // expect: The API returns a 400/422 error due to missing token
    await expect(page.getByText('Success!')).not.toBeVisible();
  });
});
