// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('Logo link navigates back to home page', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The login page is displayed
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // 2. Click the 'RawStack' logo link in the header
    await page.getByRole('link', { name: 'RawStack' }).click();

    // expect: The browser navigates to http://localhost:3000/
    await expect(page).toHaveURL('http://localhost:3000/');

    // expect: The home page hero content is visible
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();
  });
});
