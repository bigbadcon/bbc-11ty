/* global process require exports */
const axios = require("axios");
require("dotenv").config();
const environment = process.env.CONTEXT;

// Google Sheet logger
const { GoogleSpreadsheet } = require("google-spreadsheet");
const googleSheetId = process.env.GOOGLE_SHEET_BADGE_PURCHASE;

// Send Grid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Stripe
const apiKey =
	environment !== "production"
		? process.env.STRIPE_TEST_KEY
		: process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(apiKey);

// BBC API
const bbcApiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

exports.handler = async function (event) {
	const referer = event.headers.referer;
	const params = new URLSearchParams(event.body);
	const userEmail = params.get("userEmail");
	const userDisplayName = params.get("userDisplayName");
	const userId = params.get("userId");
	// gift code matches the checkout session id
	const id = params.get("code");

	try {
		const session = await stripe.checkout.sessions.retrieve(id);
		// eslint-disable-next-line no-console
		console.log(
			"🚀 ~ file: activateGiftBadge.js ~ session.metadata",
			session.metadata
		);
		// Make API call to get all line items for products when there is multiple products
		// const items = await stripe.checkout.sessions.listLineItems(
		//     id,
		//     { expand: ["data.price.product"] }
		// )

		// Get first product as right now there is only one product
		// const {name,metadata} = items.data[0]["price"]["product"]

		/* ----------------- If user email matches then add a badge ----------------- */
		if (userEmail === session.metadata.recipientEmail) {
			// if email matches the one indicated in the purchase then add the paidattendee role
			await axios.post(
				bbcApiBaseUrl + `users/addRoleToUser`,
				{
					role: "paidattendee",
					userId: parseInt(userId),
				},
				{
					headers: { "x-api-key": bbcApiKey },
				}
			);

			/* ------ If the session metadata is age:teen than update user to teen. ----- */
			// TODO: maybe double check that the product metadata is also teen?
			if (session.metadata.age === "teen") {
				await axios.post(
					bbcApiBaseUrl + `users/addRoleToUser`,
					{
						role: "teen",
						userId: parseInt(userId),
					},
					{
						headers: { "x-api-key": bbcApiKey },
					}
				);
			}

			try {
				const res = await axios.post(
					bbcApiBaseUrl + `users/removeRoleFromUser`,
					{
						role: "notattending",
						userId: userId,
					},
					{
						headers: { "x-api-key": bbcApiKey },
					}
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(
					"remove user role 'notattending' failed",
					err.toString()
				);
			}

			try {
				const res = await axios.post(
					bbcApiBaseUrl + `users/removeRoleFromUser`,
					{
						role: "subscriber",
						userId: userId,
					},
					{
						headers: { "x-api-key": bbcApiKey },
					}
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(
					"remove user role 'subscriber' for failed",
					err.toString()
				);
			}

			try {
				const res = await axios.post(
					bbcApiBaseUrl + `users/removeRoleFromUser`,
					{
						role: "donotcontact",
						userId: userId,
					},
					{
						headers: { "x-api-key": bbcApiKey },
					}
				);

				if (res.status !== 200) throw new Error("Add user role failed");
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(
					"remove user role 'subscriber' for failed",
					err.toString()
				);
			}

			/* -------------------------------------------------------------------------- */
			/*    update Google Sheet row to show that they activated their gift badge    */
			/* -------------------------------------------------------------------------- */

			const doc = new GoogleSpreadsheet(googleSheetId);

			await doc.useServiceAccountAuth({
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				private_key: process.env.GOOGLE_PRIVATE_KEY.replace(
					/\\n/g,
					"\n"
				),
			});
			await doc.loadInfo(); // loads document properties and worksheets
			// eslint-disable-next-line no-console
			console.log(doc.title);
			const sheet = doc.sheetsByIndex[0];
			const rows = await sheet.getRows();

			const giftBadgeIndex = rows.findIndex(
				(row) => row.recipientEmail === userEmail
			);

			const date = new Date().toLocaleDateString();

			if (giftBadgeIndex) {
				rows[giftBadgeIndex].giftActivated = date;
				await rows[giftBadgeIndex].save();
			}
			// eslint-disable-next-line no-console
			console.log(`google sheet updated for ${userEmail}`, date);

			/* -------------------------------------------------------------------------- */
			/*                                Email People                                */
			/* -------------------------------------------------------------------------- */

			/* ------------------------------ Send to badge holder----------------------------- */
			const newUserMsg = {
				to: userEmail,
				from: "info@bigbadcon.com",
				subject: "You have activated your Big Bad Con Gift Badge!",
				text: `Congratulations ${userDisplayName}, you have activated your Big Bad Con Badge!`,
			};

			await sgMail.send(newUserMsg);

			/* ---------------------------- Send to purchaser --------------------------- */

			const buyerMsg = {
				to: session.customer_email,
				from: "info@bigbadcon.com",
				subject: "The Big Bad Con Gift Badge has been activated!",
				text: `The Big Bad Con gift badge you sent to ${userEmail} has been activated!`,
			};

			await sgMail.send(buyerMsg);

			/* --------------------------- Admin user message --------------------------- */
			const newUserAdminMsg = {
				to: "info@bigbadcon.com",
				from: "info@bigbadcon.com",
				subject: "Gift Badge Activation",
				text: `${userDisplayName} (${userEmail}) activated their gift badge!`,
			};
			// Only fire off admin email if production
			if (environment === "production")
				await sgMail.send(newUserAdminMsg);

			return {
				// return to referer page
				statusCode: 303,
				headers: {
					Location: referer,
				},
			};
		} else {
			return {
				// send to fail page
				statusCode: 303,
				headers: {
					Location: referer.slice(0, -1) + "-fail",
				},
			};
		}
	} catch (err) {
		return {
			// send to fail page
			statusCode: 303,
			headers: {
				Location: referer.slice(0, -1) + "-fail",
			},
		};
	}
};
