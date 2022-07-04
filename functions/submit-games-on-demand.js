const axios = require('axios');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function(event, context) {

    if (event.httpMethod === 'POST') {  
        /* -------------------------------------------------------------------------- */
        /*                        1. grab submitted event data                        */
        /* -------------------------------------------------------------------------- */

        const eventBody = JSON.parse(event.body)
        console.log("🚀 ~ file: submit-games-on-demand.js ~ line 15 ~ exports.handler=function ~ eventBody", eventBody)

        

        /* -------------------------------------------------------------------------- */
        /*                        2. Submit data to google form                       */
        /* -------------------------------------------------------------------------- */

        console.log('Try submit to Google Sheet');
        try {
            // Initialize the sheet - doc ID is the long id in the sheets URL
            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_GAMES_ON_DEMAND)

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

            /* -------------------------------------------------------------------------- */
            /*                               3. email people                              */
            /* -------------------------------------------------------------------------- */
            
            const newUserMsg = {
                to: eventBody.userEmail,
                from: 'info@bigbadcon.com',
                subject: 'Thanks for Submitting to Games on Demand',
                text: `Thank you ${eventBody.publicName} for submitting to Games on Demand! Our staff will review your submission and let you know about scheduling`,
                html: `Thank you ${eventBody.publicName} for submitting to Games on Demand! Our staff will review your submission and let you know about scheduling`,
            }

            await sgMail.send(newUserMsg);
            /* --------------------------- Admin user message --------------------------- */
            const newUserAdminMsg = {
                to: 'info@bigbadcon.com',
                from: 'info@bigbadcon.com',
                subject: 'Games on Demand 2022 submission',
                text: `User ${eventBody.publicName} (${eventBody.userEmail}) submitted to Games on Demand! You can find their submission on google sheets: https://docs.google.com/spreadsheets/d/1FBurJ_G3_FN4BhAsKzuuMI03DMwCTYMyOHUbMhrW5qI/edit#gid=0`,
                html: `User ${eventBody.publicName} (${eventBody.userEmail}) submitted to Games on Demand! You can find their submission on <a href="https://docs.google.com/spreadsheets/d/1FBurJ_G3_FN4BhAsKzuuMI03DMwCTYMyOHUbMhrW5qI/edit#gid=0">google sheets</a>.`,
            }
            await sgMail.send(newUserAdminMsg);

            return {
                statusCode: 200,
                body: 'Success!',
            }

        } catch (e) {
            console.log('Google Sheet and/or emails failed', e)
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