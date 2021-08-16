const axios = require('axios');
const rootCas = require('ssl-root-cas').create();
const https = require('https')
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* ----- Inject cert to avoid the UNABLE_TO_VERIFY_LEAF_SIGNATURE error ----- */
rootCas.addFile('./certs/bigbadcon-com-chain.pem');
https.globalAgent.options.ca = rootCas;

const apiBaseUrl = 'https://www.bigbadcon.com:8091/api/'

exports.handler = async function(event, context) {
    // your server-side functionality
    const payload = JSON.parse(event.body).payload;
    const data = payload.data
    console.log("submission data", data);

    if (data.formName === 'create-account') {
        console.log("create account function start");
        const { displayName, firstName, lastName, nickname, userEmail, userNicename, userLogin, userPass, twitter } = data

        const params = {
            displayName: displayName, 
            firstName: firstName, 
            lastName: lastName, 
            nickname: nickname, 
            userEmail: userEmail, 
            userNicename: userNicename, 
            userLogin: userLogin, 
            userPass: userPass,
            userUrl: ""
            // twitter: twitter
        }

        try {
            const res = await axios.put(apiBaseUrl + 'users/create', params)
            // console.log("put response", res);
            console.log("New user successfully created for", userNicename, userEmail, displayName);

            /* --------------------------- New user message ---------------------------- */
            const newUserMsg = {
                to: userEmail,
                from: 'info@bigbadcon.com', 
                subject: 'Big Bad Con New User Account',
                text: `Welcome ${displayName}! Your new user account has been created. You can now return to bigbadcon.com to log in!`,
                html: `Welcome ${displayName}! Your new user account has been created. You can now return to <a href="http://www.bigbadcon.com>Big Bad Con</a> to log in!`,
            }
            /* ---------------------------- SendGrid function --------------------------- */
            sgMail
            .send(newUserMsg)
            .then(() => {
                console.log(`New User Success Email sent to ${userEmail}`)
            })
            .catch((error) => {
                console.error(error)
            })

            /* --------------------------- Admin user message --------------------------- */
            const newUserAdminMsg = {
                to: 'info@bigbadcon.com',
                from: 'info@bigbadcon.com', 
                subject: 'New User added',
                text: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
                html: `New user ${displayName} added! Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
            }
            /* ---------------------------- SendGrid function --------------------------- */
            sgMail
            .send(newUserAdminMsg)
            .then(() => {
                console.log(`Admin Email sent for ${userEmail}`)
            })
            .catch((error) => {
                console.error(error)
            })

            /* ------------------------------- Return 200 ------------------------------- */
            return {
                statusCode: 200,
                body: "account submitted"
            }
        } catch(e) {
            console.log("account submission error", e);

            /* --------------------------- New user message ---------------------------- */
            const newUserMsg = {
                to: userEmail,
                from: 'info@bigbadcon.com', 
                subject: 'Big Bad Con New User Account',
                text: `Hello ${displayName}, Unfortunately there was a problem adding your account. This could have been for several reasons including if there already was a user by that name or email in the system. Or just server error. An email has been sent to our admin staff to see what is wrong. If you have any questions you can reply to this message.`,
                html: `Hello ${displayName}, Unfortunately there was a problem adding your account. This could have been for several reasons including if there already was a user by that name or email in the system. Or just server error. An email has been sent to our admin staff to see what is wrong. If you have any questions you can reply to this message.`,
            }
            /* ---------------------------- SendGrid function --------------------------- */
            sgMail
            .send(newUserMsg)
            .then(() => {
                console.log(`Failed New User Email sent to ${userEmail}`)
            })
            .catch((error) => {
                console.error(error)
            })

            /* --------------------------- Admin user message --------------------------- */
            const newUserAdminMsg = {
                to: 'info@bigbadcon.com',
                from: 'info@bigbadcon.com', 
                subject: 'New User Account Creation Failed',
                text: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
                html: `The user ${displayName} attempted but failed to create an account. Not sure why it failed. Email: ${userEmail}; Full name: ${firstName} ${lastName}; userNicename: ${userNicename}`,
            }
            /* ---------------------------- SendGrid function --------------------------- */
            sgMail
            .send(newUserAdminMsg)
            .then(() => {
                console.log(`Failed New User Email sent to admin about ${userEmail}`)
            })
            .catch((error) => {
                console.error(error)
            })

            return {
                statusCode: e.response.status,
                body: "error in account submission"
            }
        }
 
    }

    return {
        statusCode: 500,
        body: "no response as different form"
    }
}