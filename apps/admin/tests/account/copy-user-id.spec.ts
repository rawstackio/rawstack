// spec: tests/test.plan.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Account Form (Edit Own Account)', () => {
  test('Copying user ID to clipboard works', async ({ page }) => {
    // Open the Account drawer for the current user
    await page.goto('http://localhost:5173');

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    await sidebar.getByText(adminEmail).click();
    await page.getByRole('menu').getByRole('menuitem', { name: 'Account' }).click();
    await expect(page.getByText('Edit Your Account')).toBeVisible();

    // expect: The clipboard copy icon is displayed next to the Id field
    const copyButton = page.getByRole('button', { name: /clipboard/i });
    await expect(copyButton).toBeVisible();

    // 2. Click the clipboard copy button
    await copyButton.click();

    // expect: The icon changes to a clipboard-check icon indicating the copy was successful
    // After clicking, the icon changes from IconClipboardCopy to IconClipboardCheck
    await expect(page.getByRole('button', { name: /clipboard-check/i })).toBeVisible();
  });
});
