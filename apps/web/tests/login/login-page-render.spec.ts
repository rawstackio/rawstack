// spec: tests/test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('Login page renders correctly with all expected elements', async ({ page }) => {
    // 1. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // expect: The heading 'Login to your account' is visible
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    // expect: An Email input field is present with placeholder 'hi@rawstack.io'
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('placeholder', 'hi@rawstack.io');

    // expect: A Password input field is present with placeholder '*********'
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveAttribute('placeholder', '*********');

    // expect: The 'Login' button is present and initially disabled
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();

    // expect: A 'Forgot Password' link is visible linking to /reset-password
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveAttribute('href', '/reset-password');

    // expect: A 'Sign up' link is visible linking to /register
    const signUpLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute('href', '/register');

    // expect: The RawStack logo is visible in the header
    await expect(page.getByRole('link', { name: 'RawStack' })).toBeVisible();
  });
});
