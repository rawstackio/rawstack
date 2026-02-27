// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test('Registration page renders correctly with all expected elements', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/register
    await page.goto('http://localhost:3000/register');

    // expect: The heading 'Create an Account' is visible
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // expect: An Email input field is present with placeholder 'hi@rawstack.io'
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('placeholder', 'hi@rawstack.io');

    // expect: A Password input field is present with placeholder '*********'
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveAttribute('placeholder', '*********');

    // expect: A Confirm Password input field is present with placeholder '*********'
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toHaveAttribute('placeholder', '*********');

    // expect: A 'Register' button is visible
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    // expect: A 'Login' link is visible linking to /login for users who already have an account
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });
});
