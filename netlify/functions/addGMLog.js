require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

exports.handler = async function (event) {
	const eventBody = JSON.parse(event.body);
	const today = new Date();
	console.log(today, eventBody);

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
			...eventBody,
			date: new Date().toLocaleDateString(),
		};
		await sheet.addRow(googleSheetPayload);
	} catch (error) {
		console.log(error);
	}

	return {
		statusCode: 200,
		body: ``,
	};
};
