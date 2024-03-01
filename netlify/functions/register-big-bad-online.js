require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const apiKey = `ApiKey ${process.env.BBC_API_KEY}`;

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
	const successUrl = event.headers.origin + "/register-thank-you/";
	const failUrl = event.headers.origin + "/register-failed/";
	const params = getParams(event.body);

	console.log(`Try find ${params.userNicename} in Google Sheet`);

	try {
		// Initialize the sheet - doc ID is the long id in the sheets URL
		const serviceAccountAuth = new JWT({
			email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});

		const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_REGISTER_BIGBADONLINE, serviceAccountAuth);

		// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

		await doc.loadInfo(); // loads document properties and worksheets

		// Get main sheet for this year
		const year = new Date().getFullYear();
		const sheet = await doc.sheetsByTitle[year.toString()];

		const dateAdded = new Date().toLocaleDateString();
		const addedRow = await sheet.addRow({
			dateAdded: dateAdded,
			displayName: params.displayName,
			userEmail: params.userEmail,
			userNicename: params.userNicename,
			userId: params.userId,
			"Agree To Community Standards": params["agree-to-community-standards"],
		});

		console.log("addedRow", addedRow);
	} catch (e) {
		console.log("fail adding user to google sheet", error);
		return {
			statusCode: 500,
			body: e.toString(),
		};
	}

	try {
		const config = {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-api-key": apiKey,
			},
			body: JSON.stringify({
				role: "volunteer",
				userId: params.userId,
			}),
		};
		const res = await fetch(apiBaseUrl + `users/addRoleToUser`, config);

		console.log("🚀 ~ res:", res);

		if (res.status === 200) {
			return {
				statusCode: 303,
				headers: {
					Location: successUrl,
				},
			};
		} else {
			console.log("fail adding user role");
			return {
				statusCode: 303,
				headers: {
					Location: failUrl,
				},
			};
		}
	} catch (error) {
		console.log("fail adding user role", error);
		return {
			statusCode: 303,
			headers: {
				Location: failUrl,
			},
		};
	}
};
