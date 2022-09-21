import { test, expect, chromium } from '@playwright/test';
import 'dotenv/config'

// TODO: set up test using tab from field to field
// TODO: set up test for other formats

const gameName1 = 'Lost Years'
const gameName2 = 'Bad Highway'

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

test.describe('Submit Run Games On Demand Form', () => { 
  test.beforeEach(async ({ page }) => {
    // Runs before each test and signs in each page.

    // await chromium.launch({ headless: false, slowMo: 100, devtools: true });

    await page.goto('http://localhost:8888/games-on-demand/');

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

    await expect(page.locator('#form-run-an-event')).toBeVisible()

    // Select 18+
    await page.locator('select[name="gmAge"]').selectOption('18+');

    // Check input[name="agree-to-community-standards"]
    await page.locator('input[name="agree-to-community-standards"]').check();
  
    await page.locator('select[name="gameLength"]').selectOption('2hr');

    await page.locator('select[name="playerAge"]').selectOption('18+');
  
    // Check input[name="safetyTools0"]
    await page.locator('input[name="safetyTools0"]').check();
  
    // Check input[name="safetyTools3"]
    await page.locator('input[name="safetyTools3"]').check();
  
    // Fill input[name="gameName"]
    await page.locator('input[name="gameName"]').fill(gameName1);
  
    // Fill input[name="system"]
    await page.locator('input[name="system"]').fill('Home brew');
  
    // Select Yes
    await page.locator('select[name="playtest"]').selectOption('Yes');
  
    // Fill textarea[name="gameDescription"]
    await page.locator('textarea[name="gameDescription"]').fill('A depressing game about the pandemic');
  
    // Upload 23754471700_884ab7ffd4_o.jpg
    // await page.locator('input[name="eventImage"]').setInputFiles('23754471700_884ab7ffd4_o.jpg');
  
    // Select Yes
    await page.locator('select[name="contentAdvisory"]').selectOption('Yes');
  
    // Check input[name="contentAdvisoryOptions2"]
    await page.locator('input[name="contentAdvisoryOptions2"]').check();

    // Fill input[name="gameName2"]
    await page.locator('input[name="gameName2"]').fill(gameName2);

    // Fill input[name="system2"]
    await page.locator('input[name="system2"]').fill('Home Brew');
  
    // Select Yes
    await page.locator('select[name="playtest2"]').selectOption('Yes');
  
    // Fill textarea[name="gameDescription2"]
    await page.locator('textarea[name="gameDescription2"]').fill('You are freeway engineers hired to fix the highway to hell');

    // Upload baby-stylized-xray.jpg
    // await page.locator('input[name="eventImage2"]').setInputFiles('baby-stylized-xray.jpg');
  
    // Select Yes
    await page.locator('select[name="contentAdvisory2"]').selectOption('Yes');
  
    // Check input[name="contentAdvisoryOptions23"]
    await page.locator('input[name="contentAdvisoryOptions23"]').check();
  
    // Check input[name="contentAdvisoryOptions22"]
    await page.locator('input[name="contentAdvisoryOptions22"]').check();
  
    // Check input[name="contentAdvisoryOptions21"]
    await page.locator('input[name="contentAdvisoryOptions21"]').check();
  
    // Check input[name="contentAdvisoryOptions20"]
    await page.locator('input[name="contentAdvisoryOptions20"]').check();
  
    // Check input[name="time0"]
    await page.locator('input[name="time0"]').check();
  
    // Check input[name="time3"]
    await page.locator('input[name="time3"]').check();
  
    // Select Two 4 hour shifts!
    await page.locator('select[name="shifts"]').selectOption('Two 4 hour shifts!');

    await expect(page.locator('#content form button[type="submit"]')).toBeEnabled();

    // await delay(5000);
  
    // Click text=Submit Your Event * required field Personal Info Public Badge Name We encourage  >> button
    await page.locator('text=Submit Your Event * required field Personal Info Public Badge Name We encourage  >> button').click();

    await expect(page.locator('#event-submitted')).toBeVisible();

    await expect(page.locator('#event-submitted span[x-text="eventInfo.gameName1"]')).toHaveText(gameName1)
    await expect(page.locator('#event-submitted span[x-text="eventInfo.gameName2"]')).toHaveText(gameName2)
  
  });
})

