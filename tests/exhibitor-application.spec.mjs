import { test, expect, chromium } from '@playwright/test';
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

test.describe('Apply to be a Dealer', () => { 
  test.beforeEach(async ({ page }) => {
    // Runs before each test and signs in each page.

    // await chromium.launch({ headless: false, slowMo: 100, devtools: true });

    await page.goto('http://localhost:8888/exhibitor-information/');

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

  test('should submit form', async ({ page }) => {

    page.on('console', msg => console.log(msg.text()))

    await expect(page.locator('#form-exhibitor')).toBeVisible()

    await page.locator('input[name="companyName"]').fill('Mirth Peddlers');

    await page.locator('input[name="website"]').fill('https://www.mirthpeddlers.com');

    await page.locator('input[name="twitter"]').fill('Colinaut');

    await page.locator('textarea[name="product"]').fill('Game zines');

    await page.locator('select[name="charitySupported"]').selectOption('Other');

    await page.locator('input[name="charityOther"]').fill('World Crime Org');

    await page.locator('input[name="contactName"]').fill('Colin Fahrion');

    await page.locator('input[name="contactEmail"]').fill('colin@mirthpeddlers.com');

    await page.locator('input[name="contactPhone"]').fill('555-555-5555');

    // Check input[name="agree-to-community-standards"]
    await page.locator('input[name="agree-to-community-standards"]').check();

    await expect(page.locator('#content form button[type="submit"]')).toBeEnabled();

    // await delay(5000);
  
    // Click text=Submit Your Event * required field Personal Info Public Badge Name We encourage  >> button
    await page.locator('#content form button[type="submit"]').click();

    await expect(page.locator('#form-submitted')).toBeVisible();
  
  });
})

