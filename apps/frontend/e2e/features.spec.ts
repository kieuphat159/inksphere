import { test, expect } from '@playwright/test';

test.describe('InkSphere Phase 2 Features E2E Tests', () => {

  test('should search posts from navbar', async ({ page }) => {
    await page.goto('/');

    // Check search button/input is visible
    const searchButton = page.locator('button:has-text("Search")').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
    }

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();

    // Type query and press enter
    await searchInput.fill('NestJS');
    await searchInput.press('Enter');

    // Should redirect to search page
    await expect(page).toHaveURL(/\/search\?q=NestJS/);
    
    // Header should show search results query
    await expect(page.locator('h1').first()).toContainText('Search Results');
  });

  test('should display tags filtering page', async ({ page }) => {
    await page.goto('/tags/General');

    // Header should contain the tag name
    await expect(page.locator('h1').first()).toContainText('General');
  });

  test('should redirect unauthenticated users on private pages', async () => {
    // We expect Next.js to redirect to signin since no session cookie is present
    test.skip();
  });
});
