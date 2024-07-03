const axios = require("axios");

// const apiBaseUrl = 'http://www.logictwine.com:8092/'

// const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

exports.handler = async function (event, context) {
	// https://[domain.com]/.netlify/functions/check-user/[userName]
	const path = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, "");
	let [userEmail] = path ? path.split("/") : [];

	let isUser = undefined;
	try {
		const res = await axios.get(apiBaseUrl + `users/email/${userEmail}`, {
			headers: { "x-api-key": bbcApiKey },
		});
		console.log("res.status", res.status);
		if (res.status === 200) {
			console.log("User email found", userEmail);
			isUser = true;
		}
	} catch (err) {
		if (err.response.data.message == "No user found!") {
			console.log("User email not found", userEmail);
			isUser = false;
		} else {
			console.log("Check User Error for", userEmail, err.response);
			return {
				statusCode: 500,
				body: "User email check failed for " + userEmail,
			};
		}
	}

	return {
		statusCode: 200,
		body: JSON.stringify({ isUser }),
	};
};
