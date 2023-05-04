const axios = require("axios");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const environment = process.env.CONTEXT;

// BBC API
const bbcApiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

const googleSheetId = process.env.GOOGLE_SHEET_SMALL_PRESS;

exports.handler = async function (event, context) {
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
			const doc = new GoogleSpreadsheet(googleSheetId);

			// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
			await doc.useServiceAccountAuth({
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			});

			await doc.loadInfo(); // loads document properties and worksheets
			console.log(doc.title);
			const sheet = doc.sheetsByIndex[0];

			/* ---------------------- Take submit event and add row --------------------- */

			const dateAdded = new Date().toLocaleDateString();
			const addedRow = await sheet.addRow({ ...eventBody, dateAdded: dateAdded });
			console.log(`added google sheet row for ${eventBody.userDisplayName}`);

			/* -------------------------------------------------------------------------- */
			/*                               3. email people                              */
			/* -------------------------------------------------------------------------- */

			const newUserMsg = {
				to: eventBody.userEmail,
				from: "info@bigbadcon.com",
				subject: "Thanks for applying for BBC Small Press",
				text: `Thank you ${eventBody.userDisplayName} for applying for BBC Small Press! Our staff will review your submission and let you know about your application`,
				html: `Thank you ${eventBody.userDisplayName} for applying for BBC Small Press! Our staff will review your submission and let you know about your application`,
			};

			await sgMail.send(newUserMsg);
			/* --------------------------- Admin user message --------------------------- */
			const newUserAdminMsg = {
				to: "info@bigbadcon.com",
				from: "info@bigbadcon.com",
				subject: "BBC Small Press application",
				text: `User ${eventBody.userDisplayName} (${eventBody.userEmail}) applied to be BBC Small Press! You can find their submission on google sheets: https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0`,
				html: `User ${eventBody.userDisplayName} (${eventBody.userEmail}) applied to be BBC Small Press! You can find their submission on <a href="https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0">google sheets</a>.`,
			};
			if (environment === "production") await sgMail.send(newUserAdminMsg);

			/* -------------------------------------------------------------------------- */
			/*                        4. add small-press-vendor role to use                        */
			/* -------------------------------------------------------------------------- */

			const body = {
				role: "small-press-vendor",
				userId: parseInt(eventBody.userId),
			};

			const headers = { headers: { "x-api-key": bbcApiKey } };
			console.log("addRoleToUser API POST", headers, body);

			try {
				const res = await axios.post(bbcApiBaseUrl + `users/addRoleToUser`, body, headers);

				if (res.status === 200) {
					console.log(
						`small-press-vendor role added for ${eventBody.userDisplayName} userId:${eventBody.userId}`
					);

					try {
						const bookEvent = await axios.post(
							bbcApiBaseUrl + "bookings/addUserToGame",
							{
								eventId: eventBody.eventId,
								isGm: false,
								userId: parseInt(eventBody.userId),
							},
							{
								headers: { "x-api-key": bbcApiKey },
							}
						);
						console.log("bookEvent", bookEvent);
						if (bookEvent.status !== 200) throw "Status !== 200; Book PoC event failed";
						console.log(
							`eventId: ${eventBody.eventId} booked for ${eventBody.userDisplayName} userId:${eventBody.userId}`
						);
					} catch (err) {
						console.log(
							`eventId: ${eventBody.eventId} failed to book for ${eventBody.userDisplayName} userId:${eventBody.userId}`
						);
					}

					return {
						statusCode: 200,
						body: "user added volunteer role and booked event",
					};
				} else {
					return {
						statusCode: 500,
						body: "failed",
					};
				}
			} catch (err) {
				console.log("add user role for small-press-vendor failed", err.toString());
				return {
					statusCode: 200,
					body: "add user role for small-press-vendor failed",
				};
			}
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
