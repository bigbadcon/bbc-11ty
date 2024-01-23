require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const environment = process.env.CONTEXT;
const googleSheetId = process.env.GOOGLE_SHEET_SUGGEST_AN_EVENT;

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
	const referer = event.headers.referer;
	const params = getParams(event.body);

	// console.log("params", params)

	if (params.fax_number !== "") {
		// fax_number is honeypot so if full return to referrer without doing anything
		return {
			statusCode: 303,
			headers: {
				Location: referer,
			},
		};
	} else {
		delete params.fax_number;
	}

	// grab success page
	const success_page = params.success_page || "";
	delete params.success_page;

	/* -------------------------------------------------------------------------- */
	/*                           Submit to Google Sheet                           */
	/* -------------------------------------------------------------------------- */
	try {
		const doc = new GoogleSpreadsheet(googleSheetId);
		await doc.useServiceAccountAuth({
			client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		});
		await doc.loadInfo(); // loads document properties and worksheets
		// console.log(doc.title);
		const sheet = doc.sheetsByIndex[0];

		/* ---------------------- Take submit event and add row --------------------- */

		const dateAdded = new Date().toLocaleDateString();
		const addedRow = await sheet.addRow({
			...params,
			dateAdded: dateAdded,
		});
		// eslint-disable-next-line no-console
		console.log("addedRow", addedRow);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
	}

	/* -------------------------------------------------------------------------- */
	/*                                 Email Admin                                */
	/* -------------------------------------------------------------------------- */

	try {
		const newUserAdminMsg = {
			to: "info@bigbadcon.com",
			from: "info@bigbadcon.com",
			subject: "Big Bad Online Event Suggestion",
			text: `Big Bad Online Event Suggestion. You can find their submission on on google sheets: https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0`,
			html: `Big Bad Online Event Suggestion. You can find their submission on <a href="https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0">google sheets</a>.`,
		};
		if (environment === "production") await sgMail.send(newUserAdminMsg);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
	}

	/* -------------------------------------------------------------------------- */
	/*                         Email people if email added                        */
	/* -------------------------------------------------------------------------- */

	if (params.email) {
		try {
			const newUserMsg = {
				to: params.email,
				from: "info@bigbadcon.com",
				subject:
					"Thanks for submitting Big Bad Online Event Suggestion",
				text: `Thank you submitting the Big Bad Online Event Suggestion`,
				html: `Thank you submitting the Big Bad Online Event Suggestion`,
			};
			await sgMail.send(newUserMsg);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}
	}

	return {
		statusCode: 303,
		headers: {
			Location: `${event.headers.origin}/${success_page}`,
		},
	};
};
