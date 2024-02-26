const axios = require("axios");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// const apiBaseUrl = 'http://www.logictwine.com:8092/'
const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`;
// headers: {"x-api-key": apiKey}

exports.handler = async function (event) {
	if (event.httpMethod === "POST") {
		/* -------------------------------------------------------------------------- */
		/*                        1. grab submitted event data                        */
		/* -------------------------------------------------------------------------- */

		const eventBody = JSON.parse(event.body);
		console.log("🚀 ~ file: volunteer-signup.js:18 ~ eventBody:", eventBody);

		/* -------------------------------------------------------------------------- */
		/*                        2. Submit data to google form                       */
		/* -------------------------------------------------------------------------- */
		// eslint-disable-next-line no-console
		console.log("Try submit to Google Sheet");

		try {
			const serviceAccountAuth = new JWT({
				email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
				scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			});
			// Initialize the sheet - doc ID is the long id in the sheets URL
			const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_VOLUNTEER_BIGBADCON, serviceAccountAuth);

			// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

			await doc.loadInfo(); // loads document properties and worksheets
			// eslint-disable-next-line no-console
			console.log(doc.title);
			const year = new Date().getFullYear();
			const sheet = doc.sheetsByTitle[year.toString()];

			/* ---------------------- Take submit event and add row --------------------- */

			const dateAdded = new Date().toLocaleDateString();
			const addedRow = await sheet.addRow({
				dateAdded: dateAdded,
				displayName: eventBody.displayName,
				userId: eventBody.userId,
				userEmail: eventBody.userEmail,
				userAge: eventBody.yourAge, //required
				phone: eventBody.phone, //required
				discord: eventBody.discord, //required
				otherInfo: eventBody.otherInfo, //not required
				communityStandards: eventBody.communityStandards && "Agreed",
				eventId: eventBody.eventId,
				eventName: eventBody.eventName,
			});
			// eslint-disable-next-line no-console
			console.log("addedRow", addedRow);

			/* -------------------------------------------------------------------------- */
			/*                        3. add volunteer role to use                        */
			/* -------------------------------------------------------------------------- */

			const headers = { headers: { "x-api-key": apiKey } };
			const userId = parseInt(eventBody.userId);

			try {
				const res = await axios.post(
					apiBaseUrl + `users/addRoleToUser`,
					{
						role: "volunteer",
						userId: userId,
					},
					headers
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("add user role for volunteer failed", err.toString());
			}

			/* -------------------------------------------------------------------------- */
			/*                    4. Remove notattending and subscriber role for user                    */
			/* -------------------------------------------------------------------------- */
			try {
				const res = await axios.post(
					apiBaseUrl + `users/removeRoleFromUser`,
					{
						role: "notattending",
						userId: userId,
					},
					headers
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("remove user role 'notattending' for volunteer failed", err.toString());
			}

			try {
				const res = await axios.post(
					apiBaseUrl + `users/removeRoleFromUser`,
					{
						role: "subscriber",
						userId: userId,
					},
					headers
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("remove user role 'subscriber' for volunteer failed", err.toString());
			}

			/* -------------------------------------------------------------------------- */
			/*                          5. Sign up user for event                         */
			/* -------------------------------------------------------------------------- */

			try {
				const bookEvent = await axios.post(
					apiBaseUrl + "bookings/addUserToGame",
					{
						eventId: eventBody.eventId,
						isGm: false,
						userId: parseInt(userId),
					},
					{
						headers: { "x-api-key": apiKey },
					}
				);

				if (bookEvent.status !== 200) throw "Status !== 200; Book volunteer shift event failed";
				// eslint-disable-next-line no-console
				console.log(`eventId: ${eventBody.eventId} booked for ${eventBody.displayName} userId:${userId}`);
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(
					`eventId: ${eventBody.eventId} failed to book for ${eventBody.displayName} userId:${userId}`
				);
			}

			/* -------------------------------------------------------------------------- */
			/*                                6. Return 200                               */
			/* -------------------------------------------------------------------------- */

			return {
				statusCode: 200,
				body: `${eventBody.displayName} (${userId}) added volunteer role and added to event ${eventBody.eventId}`,
			};
		} catch (e) {
			// eslint-disable-next-line no-console
			console.log("Google Sheet add failed", e);
			return {
				statusCode: 500,
				body: e.toString(),
			};
		}
	} else {
		return {
			statusCode: 500,
			body: "only post events are all allowed",
		};
	}
};
