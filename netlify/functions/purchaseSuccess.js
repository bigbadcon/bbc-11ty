const axios = require("axios");
require("dotenv").config();

// Google Sheet logger
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const googleSheetId = process.env.GOOGLE_SHEET_BADGE_PURCHASE;

// Send Grid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Stripe
const environment = process.env.CONTEXT;
const apiKey = environment === "dev" ? process.env.STRIPE_TEST_KEY : process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(apiKey);

// locally these both use the Stripe CLI listener webhook
const webhookSecret =
	environment === "dev" ? process.env.STRIPE_TEST_WEBHOOK_SECRET : process.env.STRIPE_WEBHOOK_SECRET;

// BBC API
const bbcApiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

exports.handler = async function (event) {
	const { body, headers } = event;

	try {
		/* -------------------------------------------------------------------------- */
		/*                          Get Stripe Response Data                          */
		/* -------------------------------------------------------------------------- */

		// Check that event came from Stripe
		const stripeEvent = stripe.webhooks.constructEvent(body, headers["stripe-signature"], webhookSecret);

		// Only run if this is a completed event
		if (stripeEvent.type === "checkout.session.completed") {
			const { id, client_reference_id, customer_details, customer_email, metadata } = stripeEvent.data.object;

			// Future Proof
			// Get session data
			const session = await stripe.checkout.sessions.retrieve(id);
			// Make API call to get all line items for products when there is multiple products
			const items = await stripe.checkout.sessions.listLineItems(id, {
				expand: ["data.price.product"],
			});

			// Get first product as right now there is only one product
			const { name } = items.data[0]["price"]["product"];

			const purchaseData = {
				date: new Date().toLocaleDateString(),
				product: name,
				productType: metadata.productType,
				userDisplayName: metadata.userDisplayName,
				userId: client_reference_id,
				userEmail: customer_email,
				country: customer_details.address.country,
				zip: customer_details.address.postal_code,
				recipient: metadata.recipient,
				recipientEmail: metadata.recipientEmail,
				anonymous: metadata.anon,
				amount_total: session.amount_total / 100,
			};

			/* -------------------------------------------------------------------------- */
			/*                    Update user role if not a gift                          */
			/* -------------------------------------------------------------------------- */
			const isGift = metadata.recipient === "for someone else";
			const userId = parseInt(client_reference_id);

			/* -------------------------------------------------------------------------- */
			/*             Set roles for badges as long as they are not gifts             */
			/* -------------------------------------------------------------------------- */
			if (metadata.productType === "badge" && !isGift) {
				await axios.post(
					bbcApiBaseUrl + `users/addRoleToUser`,
					{
						role: "paidattendee",
						userId: userId,
					},
					{
						headers: { "x-api-key": bbcApiKey },
					}
				);

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
					console.log("remove user role 'notattending' failed", err.toString());
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
					console.log("remove user role 'subscriber' for failed", err.toString());
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
					console.log("remove user role 'subscriber' for failed", err.toString());
				}

				if (metadata.age === "teen") {
					await axios.post(
						bbcApiBaseUrl + `users/addRoleToUser`,
						{
							role: "teen",
							userId: parseInt(client_reference_id),
						},
						{
							headers: { "x-api-key": bbcApiKey },
						}
					);
				}
			}

			/* -------------------------------------------------------------------------- */
			/*          If this is the PoC Dinner 3263 then check them into the event     */
			/* -------------------------------------------------------------------------- */

			// TODO: make this dynamic so the event id can change each year
			if (metadata.productType === "poc-dinner") {
				// eslint-disable-next-line no-console
				console.log("Attempt to Book PoC Dinner");
				try {
					const bookEvent = await axios.post(
						bbcApiBaseUrl + "bookings/addUserToGame",
						{
							eventId: 3998,
							isGm: false,
							userId: parseInt(client_reference_id),
						},
						{
							headers: { "x-api-key": bbcApiKey },
						}
					);
					if (bookEvent.status !== 200) throw "Status !== 200; Book PoC event failed";
					// eslint-disable-next-line no-console
					console.log("Book PoC Dinner Post", bookEvent);
				} catch (err) {
					// eslint-disable-next-line no-console
					console.log(err);
				}
			}

			/* -------------------------------------------------------------------------- */
			/*                            Send to google sheet                            */
			/* -------------------------------------------------------------------------- */

			const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
			const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

			// Initialize the sheet - doc ID is the long id in the sheets URL
			const serviceAccountAuth = new JWT({
				email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
				key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
				scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			});

			const doc = new GoogleSpreadsheet(googleSheetId, serviceAccountAuth);

			await doc.loadInfo(); // loads document properties and worksheets

			const year = new Date().getFullYear().toString();
			let sheet = doc.sheetsByTitle[year];
			if (!sheet) {
				sheet = await doc.addSheet({ title: year, headerValues: Object.keys(purchaseData) });
			}

			/* ---------------------- Take submit event and add row --------------------- */

			await sheet.addRow(purchaseData);
			// eslint-disable-next-line no-console
			console.log(`added google sheet row for ${metadata.userDisplayName} purchase of ${name}`);

			/* -------------------------------------------------------------------------- */
			/*                                Email People                                */
			/* -------------------------------------------------------------------------- */

			let recipientType = isGift ? ` for ${metadata.recipientEmail}` : ``;
			const userMsg =
				metadata.productType === "poc dinner"
					? `Thank you ${metadata.userDisplayName} for contributing to the ${name}!`
					: `Thank you ${metadata.userDisplayName} for purchasing a ${name}${recipientType}!`;

			/* ------------------------------ Send to buyer ----------------------------- */
			const newUserMsg = {
				to: customer_email,
				from: "info@bigbadcon.com",
				subject: "Thanks for your purchase!",
				text: userMsg,
				html: userMsg,
			};

			await sgMail.send(newUserMsg);

			/* ------------------ Sent to other person if it is a gift ------------------ */
			if (isGift && metadata.recipientEmail) {
				const msgIntro =
					metadata.anon === "known"
						? `You have received a gift ${name} for Big Bad Con from ${metadata.userDisplayName}!`
						: `You have received an anonymous gift ${name} for Big Bad Con!`;
				const newUserMsg = {
					to: metadata.recipientEmail,
					from: "info@bigbadcon.com",
					subject: "Big Bad Con Gift Badge",
					text: `${msgIntro} To activate your gift badge visit https://www.bigbadcon.com/activate-gift-badge and enter the gift code '${id}'. To activate the card you must have a Big Bad Con account with the matching email address (${metadata.recipientEmail}). If you have a Big Bad Con account already with a different email address please email us so we can help. If you already have a badge and want to gift this to another person please contact us.`,
					html: `${msgIntro} To activate your gift badge visit our <a href="https://www.bigbadcon.com/activate-gift-badge">badge activation</a> page and enter the gift code:<br><br><b>${id}</b><br><br>To activate the card you must have a Big Bad Con account with the matching email address (${metadata.recipientEmail}). If you have a Big Bad Con account already with a different email address please email us so we can help. If you already have a badge and want to gift this to another person please contact us.`,
				};

				await sgMail.send(newUserMsg);
			}
			// TODO: add error email to admin if metadata.recipientEmail is missing
			/* --------------------------- Admin user message --------------------------- */
			const newUserAdminMsg = {
				to: "info@bigbadcon.com",
				from: "info@bigbadcon.com",
				subject: "Badge Purchase",
				text: `${metadata.userDisplayName} has purchased a ${name}${recipientType}! You can find their purchase on google sheets: https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0`,
				html: `${metadata.userDisplayName} has purchased a ${name}${recipientType}! You can find their purchase on google sheets: <a href="https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0">BBC Badge Sheet</a>`,
			};

			// Only fire off admin email if production
			if (environment === "production") await sgMail.send(newUserAdminMsg);
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(`error ${err}`);
		return {
			statusCode: 400,
			body: `error ${err}`,
		};
	}

	return {
		statusCode: 200,
		body: `Success`,
	};
};

/* ----------------------- Info from Stripe webhook ---------------------- */
// {
//     "id": "evt_1Lbe7EI1138wOHDnA45AKE3l",
//     "object": "event",
//     "api_version": "2015-06-15",
//     "created": 1661664780,
//     "data": {
//       "object": {
//         "id": "cs_test_a1DdC2Mo8iQ38POzbTG0hbi4uysxX2l0GcPpCSjgCectEYOFgonJszUWJO",
//         "object": "checkout.session",
//         "after_expiration": null,
//         "allow_promotion_codes": null,
//         "amount_subtotal": 7500,
//         "amount_total": 7500,
//         "automatic_tax": {
//           "enabled": false,
//           "status": null
//         },
//         "billing_address_collection": null,
//         "cancel_url": "http://localhost:8888/buy-a-badge/",
//         "client_reference_id": "493",
//         "consent": null,
//         "consent_collection": null,
//         "currency": "usd",
//         "customer": "cus_MKIiFpPlHlHA4J",
//         "customer_creation": "always",
//         "customer_details": {
//           "address": {
//             "city": null,
//             "country": "US",
//             "line1": null,
//             "line2": null,
//             "postal_code": "94590",
//             "state": null
//           },
//           "email": "colin.fahrion@gmail.com",
//           "name": "Colin Fahrion",
//           "phone": null,
//           "tax_exempt": "none",
//           "tax_ids": [

//           ]
//         },
//         "customer_email": "colin.fahrion@gmail.com",
//         "expires_at": 1661751140,
//         "livemode": false,
//         "locale": null,
//         "metadata": {
//           "recipient": "for me",
//           "recipientEmail": "",
//           "anon": ""
//         },
//         "mode": "payment",
//         "payment_intent": "pi_3Lbe6aI1138wOHDn15exL8CN",
//         "payment_link": null,
//         "payment_method_collection": "always",
//         "payment_method_options": {
//         },
//         "payment_method_types": [
//           "card"
//         ],
//         "payment_status": "paid",
//         "phone_number_collection": {
//           "enabled": false
//         },
//         "recovered_from": null,
//         "setup_intent": null,
//         "shipping": null,
//         "shipping_address_collection": null,
//         "shipping_options": [

//         ],
//         "shipping_rate": null,
//         "status": "complete",
//         "submit_type": null,
//         "subscription": null,
//         "success_url": "https://www.bigbadcon.com/buy-a-badge-thanks/",
//         "total_details": {
//           "amount_discount": 0,
//           "amount_shipping": 0,
//           "amount_tax": 0
//         },
//         "url": null
//       }
//     },
//     "livemode": false,
//     "pending_webhooks": 2,
//     "request": null,
//     "type": "checkout.session.completed"
//   }
