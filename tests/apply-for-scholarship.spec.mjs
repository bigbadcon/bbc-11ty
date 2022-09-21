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

test.describe('Apply for Scholarship', () => { 
  test.beforeEach(async ({ page }) => {
    // Runs before each test and signs in each page.

    // await chromium.launch({ headless: false, slowMo: 100, devtools: true });

    await page.goto('http://localhost:8888/apply-for-scholarship/');

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

    await expect(page.locator('#form-scholarship')).toBeVisible()

    // Select 18+
    await page.locator('select[name="yourAge"]').selectOption('18+');

    // Check input[name="agree-to-community-standards"]
    await page.locator('input[name="agree-to-community-standards"]').check();

    await page.locator('input[name="twitter"]').fill('Colinaut');

    await page.locator('input[name="instagram"]').fill('Colinaut');

    await page.locator('input[name="facebook"]').fill('NA');

    await page.locator('input[name="atype0"]').check();

    await page.locator('input[name="atype1"]').check();

    await page.locator('input[name="night1"]').check();

    await page.locator('input[name="night2"]').check();
  
    await page.locator('select[name="shareRoom"]').selectOption('Yes'); 

    await page.locator('select[name="shareRoomWho"]').selectOption('Other (fill in below)');

    await page.locator('input[name="shareRoomWhoOther"]').fill('No Gelatinous Cubes');

    await page.locator('input[name="travelCosts"]').fill('$4 million dollars!!!');

    await page.locator('select[name="fundsRequired"]').selectOption('Full assistance (100% covered by Scholarship)');

    await page.locator('input[name="identity2"]').check();

    await page.locator('input[name="identity3"]').check();

    await page.locator('input[name="identity4"]').check();

    await page.locator('input[name="identitiesOther"]').fill('Pudding Monster');

    await page.locator('textarea[name="gamingXp"]').fill('I like games!!!!');

    await expect(page.locator('#content form button[type="submit"]')).toBeEnabled();

    // await delay(5000);
  
    // Click text=Submit Your Event * required field Personal Info Public Badge Name We encourage  >> button
    await page.locator('#content form button[type="submit"]').click();

    await expect(page.locator('#form-submitted')).toBeVisible();
  
  });
})

