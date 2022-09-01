const axios = require('axios');
require('dotenv').config();
const environment = process.env.CONTEXT

// Send Grid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Stripe
const apiKey = environment !== "production"
    ? process.env.STRIPE_TEST_KEY
    : process.env.STRIPE_SECRET_KEY

const stripe = require('stripe')(apiKey)

// BBC API
const bbcApiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'
const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`

exports.handler = async function (event, context) {
    const referer = event.headers.referer
    console.log("🚀 ~ file: activateGiftBadge.js ~ line 16 ~ referer", referer)
    const params = new URLSearchParams(event.body)
    const userEmail = params.get('userEmail')
    const userDisplayName = params.get('userDisplayName')
    const userId = params.get('userId')
    // gift code matches the checkout session id
    const id = params.get('code')

    try {
        const session = await stripe.checkout.sessions.retrieve( id )
        console.log("🚀 ~ file: activateGiftBadge.js ~ line 19 ~ session", session)
        if (userEmail === session.metadata.recipientEmail) {
            // if email matches the one indicated in the purchase then add the paidattendee role
            const res = await axios.post(bbcApiBaseUrl + `users/addRoleToUser`,
                {
                    "role": "paidattendee",
                    "userId": parseInt(userId)
                },
                {
                    headers: {"x-api-key": bbcApiKey}
                }
            )

            // TODO update Google Sheet row to show that they activated their gift badge
            /* -------------------------------------------------------------------------- */
            /*                                Email People                                */
            /* -------------------------------------------------------------------------- */

            /* ------------------------------ Send to badge holder----------------------------- */
            const newUserMsg = {
                to: userEmail,
                from: 'info@bigbadcon.com',
                subject: 'You have activated your Big Bad Con Gift Badge!',
                text: `Congratulations ${userDisplayName}, you have activated your Big Bad Con Badge!`,
            }

            await sgMail.send(newUserMsg);

            /* ---------------------------- Send to purchaser --------------------------- */

            const buyerMsg = {
                to: session.customer_email,
                from: 'info@bigbadcon.com',
                subject: 'The Big Bad Con Gift Badge has been activated!',
                text: `The Big Bad Con gift badge you sent to ${userEmail} has been activated!`,
            }

            await sgMail.send(buyerMsg);

            /* --------------------------- Admin user message --------------------------- */
            const newUserAdminMsg = {
                to: 'info@bigbadcon.com',
                from: 'info@bigbadcon.com',
                subject: 'Gift Badge Activation',
                text: `${userDisplayName} (${userEmail}) activated their gift badge!`,
            }
            // Only fire off admin email if production
            if (environment === "production") await sgMail.send(newUserAdminMsg);

            return {
                // return to referer page
                statusCode: 303,
                headers: {
                    Location: referer
                }
            }
        } else {
            return {
                // send to fail page
                statusCode: 303,
                headers: {
                    Location: referer.slice(0, -1) + "-fail"
                }
            }
        }
    } catch (err) {
        return {
            // send to fail page
            statusCode: 303,
            headers: {
                Location: referer.slice(0, -1) + "-fail"
            }
        }
    }

}