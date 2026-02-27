// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Layout and Responsiveness', () => {
  test("'Add User' label is only shown on large screens", async ({ page }) => {
    // 1. Navigate to http://localhost:5173/users as an authenticated admin user on a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/users');

    // expect: The 'Add User' button shows the plus icon and the 'Add User' text label
    const addUserBtn = page.getByRole('button', { name: 'Add User' });
    await expect(addUserBtn).toBeVisible();

    // The text 'Add User' should be visible on large screens (span.hidden.lg:inline)
    const addUserLabel = addUserBtn.locator('span');
    await expect(addUserLabel).toBeVisible();

    // 2. Resize the viewport below the 'lg' breakpoint (1024px)
    await page.setViewportSize({ width: 768, height: 800 });

    // expect: The 'Add User' button shows only the plus icon; the 'Add User' text label is hidden
    // The span has class 'hidden lg:inline' so it should not be visible
    await expect(addUserLabel).not.toBeVisible();
  });
});
