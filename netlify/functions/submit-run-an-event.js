/* eslint-disable no-console */
// const axios = require("axios");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//TODO: Fix this google auth issue https://stackoverflow.com/questions/76910780/typeerror-doc-useserviceaccountauth-is-not-a-function

exports.handler = async function (event) {
	if (event.httpMethod === "POST") {
		/* -------------------------------------------------------------------------- */
		/*                        1. grab submitted event data                        */
		/* -------------------------------------------------------------------------- */

		// Get the google sheet id based on the referrer
		const googleSheetId = event.headers.referer.includes("submit-a-panel")
			? process.env.GOOGLE_SHEET_BBO_PANEL
			: process.env.GOOGLE_SHEET_RUN_AN_EVENT;

		console.log("🚀 ~ exports.handler=function ~ googleSheetId", googleSheetId);

		const eventBody = JSON.parse(event.body);
		// console.log("🚀 ~ exports.handler=function ~ eventBody", eventBody);

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

			console.log(googleSheetId, serviceAccountAuth);

			const doc = new GoogleSpreadsheet(googleSheetId, serviceAccountAuth);

			// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

			await doc.loadInfo(); // loads document properties and worksheets
			console.log(doc.title);
			const year = new Date().getFullYear();
			const sheet = doc.sheetsByTitle[year.toString()];

			/* ---------------------- Take submit event and add row --------------------- */

			const dateAdded = new Date().toLocaleDateString();
			const addedRow = await sheet.addRow({
				...eventBody,
				dateAdded: dateAdded,
			});
			console.log("addedRow", addedRow);

			return {
				statusCode: 200,
				body: JSON.stringify({ msg: "Success!" }),
			};
		} catch (e) {
			console.log("Google Sheet failed", e);
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
