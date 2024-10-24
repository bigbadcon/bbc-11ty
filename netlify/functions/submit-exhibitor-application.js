require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const environment = process.env.CONTEXT;

const googleSheetId = process.env.GOOGLE_SHEET_EXHIBITOR;

exports.handler = async function (event) {
	if (event.httpMethod === "POST") {
		/* -------------------------------------------------------------------------- */
		/*                        1. grab submitted event data                        */
		/* -------------------------------------------------------------------------- */

		const eventBody = JSON.parse(event.body);

		/* -------------------------------------------------------------------------- */
		/*                        2. Submit data to google form                       */
		/* -------------------------------------------------------------------------- */

		console.log("Try submit to Google Sheet");

		try {
			// Initialize the sheet - doc ID is the long id in the sheets URL
			const serviceAccountAuth = new JWT({
				email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
				scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			});

			// Initialize the sheet - doc ID is the long id in the sheets URL
			const doc = new GoogleSpreadsheet(googleSheetId, serviceAccountAuth);

			await doc.loadInfo(); // loads document properties and worksheets
			console.log(doc.title);
			const year = new Date().getFullYear();
			const sheet = doc.sheetsByTitle[year.toString()];

			/* ---------------------- Take submit event and add row --------------------- */

			const dateAdded = new Date().toLocaleDateString();
			const addedRow = await sheet.addRow({ ...eventBody, dateAdded: dateAdded });
			console.log("addedRow", addedRow);

			/* -------------------------------------------------------------------------- */
			/*                               3. email people                              */
			/* -------------------------------------------------------------------------- */

			const newUserMsg = {
				to: eventBody.userEmail,
				from: "info@bigbadcon.com",
				subject: "Thanks for applying to be BBC Exhibitor",
				text: `Thank you ${eventBody.userDisplayName} for applying to be BBC Exhibitor! Our staff will review your submission and let you know about your application`,
				html: `Thank you ${eventBody.userDisplayName} for applying to be BBC Exhibitor! Our staff will review your submission and let you know about your application`,
			};

			await sgMail.send(newUserMsg);
			/* --------------------------- Admin user message --------------------------- */
			const newUserAdminMsg = {
				to: "info@bigbadcon.com",
				from: "info@bigbadcon.com",
				subject: "BBC Exhibitor application",
				text: `User ${eventBody.userEmail} applied to be BBC Exhibitor! You can find their submission on google sheets: https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0`,
				html: `User ${eventBody.userEmail} applied to be BBC Exhibitor! You can find their submission on <a href="https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0">google sheets</a>.`,
			};
			if (environment === "production") await sgMail.send(newUserAdminMsg);

			return {
				statusCode: 200,
				body: "Success!",
			};
		} catch (e) {
			console.log("Google Sheet and/or emails failed", e);
			return {
				statusCode: 500,
				body: e.toString(),
			};
		}
	} else {
		return {
			statusCode: 500,
			body: `only POST events are allowed`,
		};
	}
};
