// spec: tests/test.plan.md
// Auth setup - stores authenticated state in playwright/.auth/admin.json

import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page.getByLabel('Email')).toBeVisible();

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@test.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

  await page.getByLabel('Email').fill(adminEmail);
  await page.locator('#password').fill(adminPassword);

  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for dashboard content to confirm login succeeded
  await expect(page.getByText('This is your dashboard...')).toBeVisible({ timeout: 10000 });

  // Verify authData cookie is set before saving state
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((c) => c.name === 'authData');
  expect(authCookie, 'authData cookie should exist after login').toBeTruthy();

  await page.context().storageState({ path: authFile });
});
