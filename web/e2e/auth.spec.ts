
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('should load login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    });

    test('should allow user to signup', async ({ page }) => {
        const timestamp = Date.now();
        const username = `testuser_${timestamp}`;
        const email = `test_${timestamp}@example.com`;

        // Use next=/dashboard to redirect after signup
        await page.goto('/signup?next=/dashboard');
        
        await page.getByPlaceholder('Your name').fill('Test User');
        await page.getByPlaceholder('name@company.com').fill(email);
        await page.locator('input[autocomplete="username"]').fill(username);
        await page.locator('input[autocomplete="new-password"]').fill('password123');
        
        await page.getByRole('button', { name: 'Sign Up' }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should allow existing user to login', async ({ page }) => {
        const timestamp = Date.now();
        const username = `login_test_${timestamp}`;
        const email = `login_${timestamp}@example.com`;
        
        // Create user via signup with redirect to dashboard
        await page.goto('/signup?next=/dashboard');
        await page.getByPlaceholder('Your name').fill('Login Test');
        await page.getByPlaceholder('name@company.com').fill(email);
        await page.locator('input[autocomplete="username"]').fill(username);
        await page.locator('input[autocomplete="new-password"]').fill('password123');
        await page.getByRole('button', { name: 'Sign Up' }).click();
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Clear session
        await page.context().clearCookies();
        // Login with redirect to dashboard
        await page.goto('/login?next=/dashboard');

        await page.getByPlaceholder('name@company.com').fill(username);
        await page.locator('input[autocomplete="current-password"]').fill('password123');
        await page.getByRole('button', { name: 'Log In' }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });
});
