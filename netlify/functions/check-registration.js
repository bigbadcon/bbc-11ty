require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// https://[domain.com]/.netlify/functions/check-registration/[userId]/[userNicename]

exports.handler = async function (event) {
	const path = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, "");
	let [id, userNicename] = path ? path.split("/") : [];

	if (!id || !userNicename) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "Bad Request",
			}),
		};
	}

	userNicename = decodeURIComponent(userNicename);

	console.log(`Try find ${userNicename} (id: ${id}) in Google Sheet`);

	// try {
	// Initialize the sheet - doc ID is the long id in the sheets URL
	const serviceAccountAuth = new JWT({
		email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});

	const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_REGISTER_BIGBADONLINE, serviceAccountAuth);

	// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

	await doc.loadInfo(); // loads document properties and worksheets

	// Get main sheet and rows
	const year = new Date().getFullYear();
	const sheet = await doc.sheetsByTitle[year.toString()];
	const rows = await sheet.getRows();

	// Search for user based on userNicename
	// TODO: test to see if names with / break this or not Specifically user 6330 "k/C"
	const isRegistered = rows.some((row) => row.get("userId") === id && row.get("userNicename") === userNicename);
	console.log("🚀 ~ isRegistered:", isRegistered);

	const msg = isRegistered ? "is registered" : "is not registered";

	// Get Discord invite code
	const sheetDiscord = await doc.sheetsByTitle["Discord"];
	const rowsDiscord = await sheetDiscord.getRows();
	const discordInviteCode = rowsDiscord.find((row) => row.get("Year") === year.toString()).get("Discord Invite Code");
	console.log("🚀 ~ discordInviteCode:", discordInviteCode);

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: `${userNicename} ${msg}`,
			isRegistered: isRegistered,
			bboDiscordInvite: isRegistered && discordInviteCode,
		}),
	};
	// } catch (e) {
	// 	return {
	// 		statusCode: 500,
	// 		body: e.toString(),
	// 	};
	// }
};
