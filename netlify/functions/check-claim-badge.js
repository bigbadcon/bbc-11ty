require("dotenv").config();
const axios = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// BBC API
const bbcApiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function getParams(body) {
	const urlParams = new URLSearchParams(body);
	const entries = urlParams.entries();
	const result = {};
	for (const [key, value] of entries) {
		// each 'entry' is a [key, value] tupple
		result[key] = value;
	}
	return result;
}

/* -------------------------------------------------------------------------- */
/*                                Main Function                               */
/* -------------------------------------------------------------------------- */

exports.handler = async function (event) {
	const successUrl = event.headers.origin + "/badge-claim-thanks/";
	const params = getParams(event.body);

	// eslint-disable-next-line no-console
	// console.log("🚀 ~ file: check-claim-badge.js ~ params", params);

	try {
		const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
		const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

		// Initialize the sheet - doc ID is the long id in the sheets URL
		const serviceAccountAuth = new JWT({
			email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
			key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});
		// Initialize the sheet - doc ID is the long id in the sheets URL
		const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_BADGE_CLAIM, serviceAccountAuth);

		await doc.loadInfo(); // loads document properties and worksheets

		// Get main sheet and rows
		const year = new Date().getFullYear().toString();
		let sheet = doc.sheetsByTitle[year];
		const rows = await sheet.getRows();

		// Search for Badge Claim Code to see if it exists

		const badgeClaimCode = params.badgeClaimCode.trim();

		let badgeClaimCodeRowIndex = null;
		const isBadgeCodeReal = rows.some((row, i) => {
			badgeClaimCodeRowIndex = i;
			return row.get("badgeClaimCode") === badgeClaimCode;
		});
		console.log("Badge Claim code check", badgeClaimCode, rows.length, isBadgeCodeReal, badgeClaimCodeRowIndex);

		// return to error page if code does not exist
		if (!isBadgeCodeReal) {
			return {
				statusCode: 303,
				headers: {
					Location: event.headers.origin + "/badge-claim-fail-bad-code/",
				},
			};
		}

		const isBadgeCodeUsed = rows[badgeClaimCodeRowIndex].get("dateClaimed");

		console.log("isBadgeCodeUsed", isBadgeCodeUsed);

		// return to error page if code does not exist or if code is used
		if (isBadgeCodeUsed) {
			return {
				statusCode: 303,
				headers: {
					Location: event.headers.origin + "/badge-claim-fail-code-used/",
				},
			};
		}

		// add paidattendee user role
		await axios.post(
			bbcApiBaseUrl + `users/addRoleToUser`,
			{
				role: "paidattendee",
				userId: params.userId,
			},
			{
				headers: { "x-api-key": bbcApiKey },
			}
		);

		// set row with user data
		const badgeRow = rows[badgeClaimCodeRowIndex];
		badgeRow.set("userNicename", params.userNicename);
		badgeRow.set("userEmail", params.userEmail);
		badgeRow.set("userId", params.userId);
		const today = new Date().toLocaleDateString();
		badgeRow.set("dateClaimed", today);

		//save row
		await badgeRow.save();

		console.log("Badge Claim code used", badgeClaimCode, params.userNicename, params.userId, today);

		// return to success page
		return {
			statusCode: 303,
			headers: {
				Location: successUrl,
			},
		};
	} catch (e) {
		console.log(e);
		return {
			statusCode: 303,
			headers: {
				Location: event.headers.origin + "/badge-claim-fail/",
			},
		};
	}
};
