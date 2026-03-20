// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('External links on home page open correctly', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/
    await page.goto('http://localhost:3000/');

    // expect: The home page is loaded
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();

    // 2. Inspect the 'Get started' link href attribute
    const getStartedLink = page.getByRole('link', { name: 'Get started' });
    await expect(getStartedLink).toBeVisible();

    // expect: The href is https://rawstack.io
    await expect(getStartedLink).toHaveAttribute('href', 'https://rawstack.io');

    // 3. Inspect the 'GitHub' link href attribute
    const githubLink = page.getByRole('link', { name: 'GitHub' });
    await expect(githubLink).toBeVisible();

    // expect: The href is https://github.com/rawstackio/rawstack
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/rawstackio/rawstack');
  });
});
