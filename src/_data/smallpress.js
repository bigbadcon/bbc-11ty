require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// TODO: update this to grab current year
module.exports = async () => {
	const serviceAccountAuth = new JWT({
		email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});

	const doc = new GoogleSpreadsheet("1oc96lokG4l1Li0X8yoTQNNLejrpOUmheu1YaL2ISL1w", serviceAccountAuth);

	await doc.loadInfo();

	const sheet = doc.sheetsByIndex[0];
	const rows = await sheet.getRows();
	const json = rows.map((row) => {
		return {
			date: row.get("Date"),
			start: row.get("Start"),
			end: row.get("End"),
			business: row.get("Business Name"),
			website: row.get("Website"),
			product: row.get("Product"),
		};
	});

	return json;
};
