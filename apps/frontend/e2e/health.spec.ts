import { test, expect } from '@playwright/test';

test('has hero section', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Stories, notes, and thoughtful reflections.');
});
