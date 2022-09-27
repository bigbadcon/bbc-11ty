require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const environment = process.env.CONTEXT
const googleSheetId = process.env.GOOGLE_SHEET_COVID_SUPPORT

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function getParams(body) {
    const urlParams = new URLSearchParams(body)
    const entries = urlParams.entries()
    const result = {}
    for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
      result[key] = value;
    }
    return result;
}

/* -------------------------------------------------------------------------- */
/*                                Main Function                               */
/* -------------------------------------------------------------------------- */

exports.handler = async function(event, context) {  
    const referer = event.headers.referer
    const successUrl = event.headers.origin + "/covid-support-thanks/"
    const params = getParams(event.body)
    
    console.log("🚀 ~ file: submit-covid-support.js ~ line 29 ~ exports.handler=function ~ params", params)

    if (params.fax_number !== '') {
        // fax_number is honeypot so if full return to referrer without doing anything
        return {
            statusCode: 303,
            headers: {
                Location: referer,
            }
        }
    } else {
        delete params.fax_number
    }

    /* -------------------------------------------------------------------------- */
    /*                           Submit to Google Sheet                           */
    /* -------------------------------------------------------------------------- */
    try {
        const doc = new GoogleSpreadsheet(googleSheetId)
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        });
        await doc.loadInfo() // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByIndex[0]

        /* ---------------------- Take submit event and add row --------------------- */

        const dateAdded = new Date().toLocaleDateString()
        const addedRow = await sheet.addRow({...params, dateAdded: dateAdded})
        console.log("addedRow", addedRow);

    } catch (error) {
        console.log(error)
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Email Admin                                */
    /* -------------------------------------------------------------------------- */

    const support = (params.financial_support = 'yes') ? ' with a request for financial support' : ''

    try {
        const newUserAdminMsg = {
            to: 'info@bigbadcon.com',
            from: 'info@bigbadcon.com',
            subject: 'BBC Covid Support',
            text: `COVID-19 Support form submitted${support}. You can find their submission on on google sheets: https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0`,
            html: `COVID-19 Support form submitted${support}. You can find their submission on <a href="https://docs.google.com/spreadsheets/d/${googleSheetId}/edit#gid=0">google sheets</a>.`,
        }
        if (environment === "production") await sgMail.send(newUserAdminMsg);
    } catch (error) {
        console.log(error)
    }

    /* -------------------------------------------------------------------------- */
    /*                         Email people if email added                        */
    /* -------------------------------------------------------------------------- */

    if (params.email) {
        try {
            const newUserMsg = {
                to: params.email,
                from: 'info@bigbadcon.com',
                subject: 'Thanks for submitting BBC Covid Support Form',
                text: `Thank you submitting the COVID-19 support email. If you have requested financial support our staff will be in touch.`,
                html: `Thank you submitting the COVID-19 support email. If you have requested financial support our staff will be in touch.`,
            }
            await sgMail.send(newUserMsg);
        } catch (error) {
            console.log(error)
        }
    }

    return {
        statusCode: 303,
        headers: {
            Location: successUrl,
        }
    }

}