import { test, expect } from '@playwright/test';
import 'dotenv/config'

test.describe('Login', () => {
    test('should login and then close login panel', async ({ page }) => {
        // Go to http://localhost:8888/
        await page.goto('http://localhost:8888/');

        // Click text=login
        await page.click('text=Login');

        await expect(page.locator('#authModal')).toBeVisible(); //

        // Click input[name="username"]
        await page.locator('input[name="username"]').click();

        // Fill input[name="username"]
        await page.locator('input[name="username"]').fill(process.env.ADMIN_LOGIN);

        // Click input[name="password"]
        await page.locator('input[name="password"]').click();

        // Fill input[name="password"]
        await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD);

        // Click text=User Name Password Login >> button
        await page.locator('text=User Name Password Login >> button').click();

        await expect(page.locator('#authModal h2 span[x-text="user && user.displayName"]')).toHaveText(process.env.ADMIN_DISPLAYNAME); 

        // Close window
        await page.locator('#modal-user-info .close-btn').first().click();

        await expect(page.locator('#authModal')).toBeHidden(); //
    })
})