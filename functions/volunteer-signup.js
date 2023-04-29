const axios = require("axios");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");

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

		/* -------------------------------------------------------------------------- */
		/*                        2. Submit data to google form                       */
		/* -------------------------------------------------------------------------- */
		// eslint-disable-next-line no-console
		console.log("Try submit to Google Sheet");

		try {
			// Initialize the sheet - doc ID is the long id in the sheets URL
			const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_VOLUNTEER_BIGBADCON_2022);

			// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
			await doc.useServiceAccountAuth({
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			});

			await doc.loadInfo(); // loads document properties and worksheets
			// eslint-disable-next-line no-console
			console.log(doc.title);
			const sheet = doc.sheetsByIndex[0];

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

			return {
				statusCode: 200,
				body: "user added volunteer role",
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
