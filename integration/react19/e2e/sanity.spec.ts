import { test, expect } from '@playwright/test';

test.describe('UI-Router React 19 Sample App', () => {
  test('loads and navigates between states', async ({ page }) => {
    await page.goto('/');

    // Should have navigation links
    await expect(page.getByTestId('home-link')).toBeVisible();
    await expect(page.getByTestId('about-link')).toBeVisible();

    // Navigate to home
    await page.getByTestId('home-link').click();
    await expect(page.getByTestId('home-title')).toHaveText('Home Page');

    // Navigate to about
    await page.getByTestId('about-link').click();
    await expect(page.getByTestId('about-title')).toHaveText('About Page');

    // Navigate back to home
    await page.getByTestId('home-link').click();
    await expect(page.getByTestId('home-title')).toHaveText('Home Page');
  });
});
