/* global process */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
import { test, expect, chromium } from "@playwright/test";
import "dotenv/config";

// TODO: set up test using tab from field to field
// TODO: set up test for other formats

const eventName = "Extradimensional Bunny Squad";
const eventDescription =
	"A elite squad of dimension hopping bunnies come into the world of Torg in search of the One True Carrot!";

// eslint-disable-next-line no-unused-vars
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//  Run headless simulation

test.use({
	headless: false,
	launchOptions: {
		logger: {
			isEnabled: (name) => name === "browser",
			log: (name, message) => console.log(`${name} ${message}`),
		},
		slowMo: 400,
		devtools: true,
	},
});

test.describe("Submit Run An Event Form", () => {
	test.beforeEach(async ({ page }) => {
		// Runs before each test and signs in each page.

		// await chromium.launch({ headless: false, slowMo: 100, devtools: true });

		await page.goto("http://localhost:8888/run-an-event/");

		// Click text=login
		await page.click("text=Login");

		await expect(page.locator("#modal")).toBeVisible(); //

		// Click input[name="username"]
		await page.locator('input[name="username"]').click();

		// Fill input[name="username"]
		await page
			.locator('input[name="username"]')
			.fill(process.env.ADMIN_LOGIN);

		// Click input[name="password"]
		await page.locator('input[name="password"]').click();

		// Fill input[name="password"]
		await page
			.locator('input[name="password"]')
			.fill(process.env.ADMIN_PASSWORD);

		// Click text=User Name Password Login >> button
		await page.locator("text=User Name Password Login >> button").click();

		await expect(
			page.locator('#modal h3 span[x-text="user && user.displayName"]')
		).toHaveText(process.env.ADMIN_DISPLAYNAME);

		// Close window
		await page.locator("#modal-user-info .close-btn").click();

		await expect(page.locator("#modal")).toBeHidden();
	});

	test("should submit an RPG Event", async ({ page }) => {
		page.on("console", (msg) => console.log(msg.text()));

		await expect(page.locator("#form")).toBeVisible();

		// await expect(page.locator('#form-run-an-event button[type="submit"]')).not.toBeEnabled();

		// Select 18+
		await page.locator('select[name="yourAge"]').selectOption("18+");

		// Check community standards
		await page.locator("input#agree-to-community-standards").check();

		// Click input[name="eventName"]
		await page.locator('input[name="eventName"]').click();

		// Fill input[name="eventName"]
		await page.locator('input[name="eventName"]').fill(eventName);

		// select RPG
		await page.locator('select[name="format"]').selectOption("RPG");

		// Click input[name="system"]
		await page.locator('input[name="system"]').click();

		// Fill input[name="system"]
		await page.locator('input[name="system"]').fill("Torg");

		// Select No
		await page.locator('select[name="playtest"]').selectOption("No");

		// Click textarea[name="eventDescription"]
		await page.locator('textarea[name="eventDescription"]').click();

		// Fill textarea[name="eventDescription"]
		await page
			.locator('textarea[name="eventDescription"]')
			.fill(eventDescription);

		// Select 18+
		await page.locator('select[name="playerAge"]').selectOption("18+");

		// Click input[name="minPlayers"]
		await page.locator('input[name="minPlayers"]').click();

		// Fill input[name="minPlayers"]
		await page.locator('input[name="minPlayers"]').fill("3");

		// Click input[name="maxPlayers"]
		await page.locator('input[name="maxPlayers"]').click();

		// Fill input[name="maxPlayers"]
		await page.locator('input[name="maxPlayers"]').fill("5");

		// Select Provided
		await page
			.locator('select[name="characters"]')
			.selectOption("Provided");

		// Select how many times to run
		await page.locator('select[name="runNumberOfTimes"]').selectOption("1");

		// Select Location Preference
		await page
			.locator('select[name="locationPref"]')
			.selectOption("Private Room");

		// Select event length 4
		await page.locator('select[name="eventLength"]').selectOption("4");

		// Check input[name="time0"]
		await page.locator('input[name="time0"]').check();

		// Check input[name="time3"]
		await page.locator('input[name="time3"]').check();

		// Check input[name="time6"]
		await page.locator('input[name="time6"]').check();

		// Select contentAdvisory
		await page
			.locator('select[name="contentAdvisory"]')
			.selectOption("Yes");

		// Check input[name="contentAdvisory2"]
		await page.locator('input[name="contentAdvisoryOptions2"]').check();

		// Click input[name="triggerWarnings"]
		await page.locator('input[name="triggerWarnings"]').click();

		// Fill input[name="triggerWarnings"]
		await page
			.locator('input[name="triggerWarnings"]')
			.fill("Bloody bunnies");

		// Check input[name="safetyTools0"]
		await page.locator('input[name="safetyTools0"]').check();

		// Check input[name="safetyTools3"]
		await page.locator('input[name="safetyTools3"]').check();

		// Check input[name="gameFocus0"]
		await page.locator('input[name="gameFocus0"]').check();

		// Check input[name="gameFocus1"]
		await page.locator('input[name="gameFocus1"]').check();

		// Check input[name="playerContributions3"]
		await page.locator('input[name="playerContributions3"]').check();

		// Check input[name="playerContributions6"]
		await page.locator('input[name="playerContributions6"]').check();

		// Check input[name="gameGenre1"]
		await page.locator('input[name="gameGenre1"]').check();

		// Click section div:has-text("Sci-Fi") >> nth=4
		await page.locator('section div:has-text("Sci-Fi")').nth(4).click();

		// Check input[name="gameGenre12"]
		await page.locator('input[name="gameGenre12"]').check();

		await page
			.locator('textarea[name="additionalGMs"]')
			.fill("I have a dozen real bunnies that will help me GM!");

		await page
			.locator('textarea[name="additionalRequirements"]')
			.fill(
				"I need a bushel of carrots for the game and to feed my bunnies!"
			);

		await expect(
			page.locator('#content form button[type="submit"]')
		).toBeEnabled();

		// await delay(5000);

		// Click text=Submit Your Event * required field Personal Info Public Badge Name We encourage  >> button
		await page.locator('#content form button[type="submit"]').click();

		await expect(page.locator("#event-submitted")).toBeVisible();

		await expect(
			page.locator("#event-submitted span#submit-format")
		).toHaveText("RPG");

		await expect(
			page.locator("#event-submitted span#submit-name")
		).toHaveText(eventName);
	});
});
