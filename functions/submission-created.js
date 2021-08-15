const axios = require('axios');
const rootCas = require('ssl-root-cas').create();
const fs = require('fs');
const resolve = require('path').resolve
const https = require('https')
// const cert = require('../certs/bigbadcon-com-chain.pem')

/* ----- Inject cert to avoid the UNABLE_TO_VERIFY_LEAF_SIGNATURE error ----- */
rootCas.addFile('certs/bigbadcon-com-chain.pem')
https.globalAgent.options.ca = rootCas;
// let cas = https.globalAgent.options.ca || []
// cas.push = fs.readFileSync(resolve('./certs/bigbadcon-com-chain.pem'))
// https.globalAgent.options.ca = cas;

// TODO: change to prod api once tested
const apiBaseUrl = 'https://www.bigbadcon.com:8091/api/'

exports.handler = async function(event, context) {
    // const isFile = fs.readFileSync(resolve('./certs/bigbadcon-com-chain.pem'))
    // console.log("🚀 ~ file: submission-created.js ~ line 15 ~ exports.handler=function ~ isFile", isFile)
    // your server-side functionality
    const submission_path = event.path;
    const submission_payload = JSON.parse(event.body).payload;
    // console.log("🚀 ~ file: submission-created.js ~ line 21 ~ exports.handler=function ~ form_name", submission_payload)

    if (submission_path === '/create-account-thank-you') {
        const { displayName, firstName, lastName, nickname, userEmail, userNicename, userLogin, userPass, twitter } = submission_payload.data

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
            console.log("put response", res);
            return {
                statusCode: 200,
                body: "done"
            }
        } catch(e) {
            console.log("error", e);
            return {
                statusCode: e.response.status,
                body: "error"
            }
        }
 
    }

    return {
        statusCode: 500,
        body: "no response as different form"
    }
}