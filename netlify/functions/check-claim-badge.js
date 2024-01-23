require("dotenv").config();
const axios = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");

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
		// Initialize the sheet - doc ID is the long id in the sheets URL
		const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_BADGE_CLAIM);

		// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
		await doc.useServiceAccountAuth({
			client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		});

		await doc.loadInfo(); // loads document properties and worksheets

		// Get main sheet and rows
		// TODO: update so it automatically uses the current year
		const sheet = await doc.sheetsByIndex[0];
		const rows = await sheet.getRows();

		// Search for Badge Claim Code to see if it exists

		const badgeClaimCode = params.badgeClaimCode.trim();

		console.log("code", badgeClaimCode, rows.length);
		const isBadgeCodeReal = rows.some((row) => {
			return row.badgeClaimCode === badgeClaimCode;
		});

		// return to error page if code does not exist
		if (!isBadgeCodeReal) {
			return {
				statusCode: 303,
				headers: {
					Location: event.headers.origin + "/badge-claim-fail-bad-code/",
				},
			};
		}

		// grab row with matching badge code
		const badgeRow = rows.findIndex((row) => row.badgeClaimCode === badgeClaimCode);

		const isBadgeCodeUsed = rows[badgeRow].dateClaimed;

		// return to error page if code is used
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
		rows[badgeRow].userNicename = params.userNicename;
		rows[badgeRow].userEmail = params.userEmail;
		rows[badgeRow].userId = params.userId;
		rows[badgeRow].dateClaimed = new Date().toLocaleDateString();

		//save row
		await rows[badgeRow].save();

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
