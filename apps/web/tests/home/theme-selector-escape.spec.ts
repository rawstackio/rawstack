// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('Theme dropdown closes when pressing Escape key', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/
    await page.goto('http://localhost:3000/');

    // expect: The home page is loaded
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();

    // 2. Click the 'Toggle theme' button to open the dropdown
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    // expect: The theme dropdown menu is visible with Light, Dark, System options
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Light' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Dark' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'System' })).toBeVisible();

    // 3. Press the Escape key
    await page.keyboard.press('Escape');

    // expect: The dropdown menu closes without any theme change
    await expect(page.getByRole('menu', { name: 'Toggle theme' })).not.toBeVisible();
  });
});
