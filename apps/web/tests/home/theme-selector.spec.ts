// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('Theme selector switches between Light, Dark, and System modes', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/
    await page.goto('http://localhost:3000/');

    // expect: The page renders with the default theme
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();

    // 2. Click the 'Toggle theme' button in the header
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    // expect: A dropdown menu appears with three options: 'Light', 'Dark', and 'System'
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Light' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Dark' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'System' })).toBeVisible();

    // 3. Click the 'Dark' menu item
    await page.getByRole('menuitem', { name: 'Dark' }).click();

    // expect: The dropdown closes
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).not.toBeVisible();

    // expect: The page visual theme changes to dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);

    // 4. Click the 'Toggle theme' button again
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    // expect: The dropdown menu re-opens
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).toBeVisible();

    // 5. Click the 'Light' menu item
    await page.getByRole('menuitem', { name: 'Light' }).click();

    // expect: The dropdown closes
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).not.toBeVisible();

    // expect: The page visual theme changes to light mode
    await expect(page.locator('html')).toHaveClass(/light/);

    // 6. Click the 'Toggle theme' button again and select 'System'
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await page.getByRole('menuitem', { name: 'System' }).click();

    // expect: The theme reverts to match the operating system preference
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).not.toBeVisible();
  });
});
