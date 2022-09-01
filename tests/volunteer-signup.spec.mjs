import { test, expect } from '@playwright/test';
import 'dotenv/config'

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//  Run headless simulation
test.use({
    headless: false, 
    launchOptions: {
        logger: {
            isEnabled: (name, severity) => name === 'browser',
            log: (name, severity, message, args) => console.log(`${name} ${message}`)
        },
        // slowMo: 400,
        devtools: true
    }
})

test.describe('Submit Volunteer Signup Form', () => {

    test.beforeEach(async ({ page }) => {
        // Runs before each test and signs in each page.

        // await chromium.launch({ headless: false, slowMo: 100, devtools: true });

        await page.goto('http://localhost:8888/volunteer/');

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
        await page.locator('#modal-user-info .close-btn').click();

        await expect(page.locator('#authModal')).toBeHidden();
    });

    test('Fill in and submit form', async ({ page }) => {

        await expect(page.locator('form#volunteer-signup button[type="submit"]')).not.toBeEnabled();

        await page.locator('select[name="yourAge"]').selectOption('18+');

        // Click input[name="phone"]
        await page.locator('input[name="phone"]').click();
      
        // Fill input[name="phone"]
        await page.locator('input[name="phone"]').fill('555-555-5555');
      
        // Press Tab
        await page.locator('input[name="phone"]').press('Tab');
      
        // Fill input[name="discord"]
        await page.locator('input[name="discord"]').fill('FakeName');
      
        // Press Tab
        await page.locator('input[name="discord"]').press('Tab');
      
        // Fill textarea[name="otherInfo"]
        await page.locator('textarea[name="otherInfo"]').fill('This is a test so delete me');
      
        // Press Tab
        await page.locator('textarea[name="otherInfo"]').press('Tab');
      
        // Check input[name="agree-to-community-standards"]
        await page.locator('input[name="agree-to-community-standards"]').check();
      
        await expect(page.locator('form#volunteer-signup button[type="submit"]')).toBeEnabled();

        // Click form Submit
        await page.locator('form#volunteer-signup button[type="submit"]').click();

        await expect(page.locator('form#volunteer-signup')).toBeHidden();
      
      });
})
