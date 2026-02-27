// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('Home page renders correctly with all expected elements', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/
    await page.goto('http://localhost:3000/');

    // expect: The page title is 'Rawstack | Public Website'
    await expect(page).toHaveTitle('Rawstack | Public Website');

    // expect: The header contains the RawStack logo and name
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();

    // expect: The header contains a 'Login' button linking to /login
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');

    // expect: The header contains a 'Toggle theme' button
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();

    // expect: The main content contains the heading 'Build something great.'
    await expect(page.getByRole('heading', { name: 'Build something great.' })).toBeVisible();

    // expect: The main content contains the subheading 'Your starting point'
    await expect(page.getByText('Your starting point')).toBeVisible();

    // expect: The main content contains descriptive paragraph text about RawStack
    await expect(page.getByText('RawStack gives you a full-stack foundation so you can skip the boilerplate and focus on what matters.')).toBeVisible();

    // expect: A 'Get started' link is visible pointing to https://rawstack.io
    const getStartedLink = page.getByRole('link', { name: 'Get started' });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', 'https://rawstack.io');

    // expect: A 'GitHub' link is visible pointing to https://github.com/rawstackio/rawstack
    const githubLink = page.getByRole('link', { name: 'GitHub' });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/rawstackio/rawstack');
  });
});
