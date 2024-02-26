const axios = require("axios");

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`;
// headers: {"x-api-key": apiKey}

function paramsToObject(entries) {
	const result = {};
	for (const [key, value] of entries) {
		// each 'entry' is a [key, value] tupple
		result[key] = value;
	}
	return result;
}

exports.handler = async function (event) {
	const referer = event.headers.referer;
	const site = referer.match(/^([htps]*?:\/\/[^/?#]+)(?:[/?#]|$)/)[1];
	const referer_uuid = referer.match(/uuid=?([0-9a-z-]*)/)[1];
	const urlParams = new URLSearchParams(event.body);
	const entries = urlParams.entries();
	const params = paramsToObject(entries);

	const { userEmail, userPass } = params;
	// eslint-disable-next-line no-console
	console.log(referer_uuid, userEmail);

	const body = {
		emailAddress: userEmail,
		password: userPass,
		uuid: referer_uuid,
	};
	const headers = { headers: { "x-api-key": apiKey } };
	try {
		const res = await axios.post(apiBaseUrl + `password/reset`, body, headers);

		if (res.status === 200) {
			return {
				statusCode: 303,
				headers: {
					Location: `${site}/change-password-success`,
				},
			};
		} else {
			return {
				statusCode: 303,
				headers: {
					Location: `${site}/change-password-fail`,
				},
			};
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.log("password change failed", err.response.status);
		return {
			statusCode: 303,
			headers: {
				Location: `${site}/change-password-fail`,
			},
		};
	}
};
