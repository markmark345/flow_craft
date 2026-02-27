
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        const timestamp = Date.now();
        const username = `dash_${timestamp}`;
        const email = `dash_${timestamp}@example.com`;

        await page.goto('/signup?next=/dashboard');
        await page.getByPlaceholder('Your name').fill('Dash User');
        await page.getByPlaceholder('name@company.com').fill(email);
        await page.locator('input[autocomplete="username"]').fill(username);
        await page.locator('input[autocomplete="new-password"]').fill('password123');
        await page.getByRole('button', { name: 'Sign Up' }).click();
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should display stat cards on dashboard', async ({ page }) => {
        // Wait for stats to load from the API (new user starts with zero counts)
        await expect(page.getByText('Total Runs')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Success Rate')).toBeVisible();
        await expect(page.getByText('Failed')).toBeVisible();
        await expect(page.getByText('Active')).toBeVisible();
    });
});
