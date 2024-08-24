require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

exports.handler = async function (event) {
	const eventBody = JSON.parse(event.body);
	const authToken = eventBody.authToken;
	delete eventBody.authToken;
	const today = new Date();
	console.log(today, eventBody);

	const url = "https://admin.bigbadcon.com:8091/api/bookings/addPlayerAsAddtlGmToGame";

	const returnBody = {
		success: false,
		message: "hasn't been added",
	};

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
			Authorization: authToken,
		},
		body: JSON.stringify({
			eventId: Number(eventBody.eventId),
			additionalGmGuid: eventBody.gmGuid,
		}),
	};

	// send to Lil Red API endpoint
	console.log(
		`try to add GM: authToken: ${authToken}; eventId: ${eventBody.eventId}; userId: ${eventBody.userId}; gmGuid: ${eventBody.gmGuid}`
	);
	try {
		const res = await fetch(url, options);
		console.log("success:", res);
		await addToGoogleSheetLog({
			eventId: eventBody.eventId,
			gmGuid: eventBody.gmGuid,
			userId: eventBody.userId,
			log: "Added as GM",
		});

		returnBody.success = true;
		returnBody.message = "Added GM";
	} catch (error) {
		console.log("fail", error);
		await addToGoogleSheetLog({
			eventId: eventBody.eventId,
			gmGuid: eventBody.gmGuid,
			userId: eventBody.userId,
			log: `failed to add event: ${error.message}`,
		});
		returnBody.message = "Failed to add GM";
	}

	async function addToGoogleSheetLog(log) {
		try {
			const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
			const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
			const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ADDGM_ERROR_LOG;

			const serviceAccountAuth = new JWT({
				email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
				key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
				scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			});

			const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
			await doc.loadInfo();
			const year = new Date().getFullYear().toString();
			let sheet = doc.sheetsByTitle[year];

			const googleSheetPayload = {
				...log,
				date: new Date().toLocaleDateString(),
			};
			await sheet.addRow(googleSheetPayload);
			console.log("Added to Google Sheet");
		} catch (error) {
			console.log("Google Sheet Error", error);
		}
	}

	return {
		statusCode: 200,
		body: JSON.stringify(returnBody), // returnBody,
	};
};
