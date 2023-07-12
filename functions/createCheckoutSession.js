/* global require process exports */
require("dotenv").config();
const environment = process.env.CONTEXT;
// const apiKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : process.env.STRIPE_SECRET_KEY;
const apiKey = process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(apiKey);

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function paramsToObject(entries) {
	const result = {};
	for (const [key, value] of entries) {
		// each 'entry' is a [key, value] tupple
		result[key] = value;
	}
	return result;
}

/* -------------------------------------------------------------------------- */
/*                   Main Function for purchasing via Stripe                  */
/* -------------------------------------------------------------------------- */

exports.handler = async function (event) {
	const referer = event.headers.referer;

	// const body = event.body
	// console.log("🚀 ~ file: createCheckoutSession.js ~ line 28 ~ event.body", event.body)

	const urlParams = new URLSearchParams(event.body);
	const entries = urlParams.entries();
	const params = paramsToObject(entries);
	// eslint-disable-next-line no-console
	console.log("🚀 ~ file: createCheckoutSession.js ~ params, apiKey", params, environment, apiKey?.substring(0, 24));

	// TODO: make this more automated
	let successUrl = "https://www.bigbadcon.com/thanks-for-your-purchase/";
	if (params.productType === "badge") successUrl = "https://www.bigbadcon.com/buy-a-badge-thanks/";
	if (params.productType === "poc-dinner") successUrl = "https://www.bigbadcon.com/poc-dinner-contribution-thanks/";

	try {
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: params.price_id,
					quantity: 1,
				},
			],
			customer_email: params.userEmail,
			client_reference_id: params.userId,
			metadata: {
				userDisplayName: params.userDisplayName,
				age: params.age,
				recipient: params.recipient,
				anon: params.anon,
				recipientEmail: params.recipientEmail && params.recipientEmail.trim(),
				productType: params.productType, // "badge" or "poc dinner"
			},
			mode: "payment",
			// TODO: customize thanks page with order details
			success_url: successUrl,
			cancel_url: referer,
			// TODO: add metadata with other person's email address
		});

		// console.log(session)

		// return session url success or cancel_url
		return {
			statusCode: 303,
			headers: {
				Location: session.url,
			},
		};
	} catch (e) {
		// eslint-disable-next-line no-console
		console.log("🚀 ~ file: createCheckoutSession.js ~ line 78 ~ e", e);
		return {
			statusCode: 303,
			headers: {
				Location: "https://www.bigbadcon.com/buy-a-badge-fail/",
			},
		};
	}
};
