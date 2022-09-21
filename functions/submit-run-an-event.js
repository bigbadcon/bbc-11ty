const axios = require('axios');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const googleSheetId = process.env.GOOGLE_SHEET_RUN_AN_EVENT

exports.handler = async function(event, context) {

    if (event.httpMethod === 'POST') {
        /* -------------------------------------------------------------------------- */
        /*                        1. grab submitted event data                        */
        /* -------------------------------------------------------------------------- */

        const eventBody = JSON.parse(event.body)
        console.log("🚀 ~ exports.handler=function ~ eventBody", eventBody)

        /* -------------------------------------------------------------------------- */
        /*                        2. Submit data to google form                       */
        /* -------------------------------------------------------------------------- */

        console.log('Try submit to Google Sheet');

        try {
            // Initialize the sheet - doc ID is the long id in the sheets URL
            const doc = new GoogleSpreadsheet(googleSheetId)

            // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
            await doc.useServiceAccountAuth({
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            });

            await doc.loadInfo() // loads document properties and worksheets
            console.log(doc.title);
            const sheet = doc.sheetsByIndex[0]

            /* ---------------------- Take submit event and add row --------------------- */

            const dateAdded = new Date().toLocaleDateString()
            const addedRow = await sheet.addRow({...eventBody, dateAdded: dateAdded})
            console.log("addedRow", addedRow);

            return {
                statusCode: 200,
                body: JSON.stringify({msg:'Success!'}),
            }

        } catch (e) {
            console.log('Google Sheet failed', e)
            return {
                statusCode: 500,
                body: e.toString(),
            }
        }

    } else {
        return {
            statusCode: 500,
            body: `only POST events are allowed`
        }
    }
}