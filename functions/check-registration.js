const axios = require('axios');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')

// https://[domain.com]/.netlify/functions/check-registration/[userId]/[userNicename]

exports.handler = async function(event, context) {

    const path = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, '')
    let [id,userNicename] = (path) ? path.split('/') : []

    try {
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_REGISTER_BIGBADONLINE_2022)

        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        });

        await doc.loadInfo() // loads document properties and worksheets
        console.log(doc.title);

        // Get main sheet and rows
        const sheet = await doc.sheetsByIndex[0]
        const rows = await sheet.getRows()

        // Search for user based on userNicename
        const isRegistered = rows.some((row) => row.userId === id && row.userNicename === userNicename)

        const discordInviteCode = "pM74SJtQH9"

        const msg = (isRegistered) ? "is registered" : "is not registered"

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `${userNicename} ${msg}`,
                isRegistered: isRegistered,
                bboDiscordInvite: isRegistered && discordInviteCode
            }),
        }

    } catch (e) {
        return {
            statusCode: 500,
            body: e.toString(),
        }
    }
}