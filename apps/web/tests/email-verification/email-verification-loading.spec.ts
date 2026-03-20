// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Email Verification Page', () => {
  test('Email verification page shows loading state initially', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/email-verification?token=some-token and immediately capture the page state
    // Intercept the API call to delay it and observe the loading state
    await page.route('**/auth/action-requests**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('http://localhost:3000/email-verification?token=some-token');

    // expect: A loading spinner or 'Loading' status indicator is briefly visible while the token is being verified against the API
    // The spinner has role="status" and aria-label="Loading"
    await expect(page.getByRole('status')).toBeVisible();
  });
});
