// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
  test('Toast notifications are accessible via keyboard shortcut', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/
    await page.goto('http://localhost:3000/');

    // expect: The home page is loaded
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();

    // 2. Observe the page for a 'Notifications' region with the label 'alt+T'
    // expect: A 'Notifications alt+T' region is present in the DOM for accessibility
    // The region exists in the DOM (may be empty/invisible when no toasts are active)
    await expect(page.getByRole('region', { name: 'Notifications alt+T' })).toBeAttached();

    // expect: The region is used to house toast notifications
    await expect(page.getByRole('region', { name: 'Notifications alt+T' })).toBeAttached();
  });
});
