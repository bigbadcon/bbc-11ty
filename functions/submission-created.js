const axios = require('axios');
const rootCas = require('ssl-root-cas').create();

/* ----- Inject cert to avoid the UNABLE_TO_VERIFY_LEAF_SIGNATURE error ----- */
rootCas.addFile('./certs/bigbadcon-com-chain.pem')
require('https').globalAgent.options.ca = rootCas;

// TODO: change to prod api once tested
const apiBaseUrl = 'https://bigbadcon.com:8091/apidev/'

exports.handler = async function(event, context) {
    // your server-side functionality
    const submission_path = event.path;
    const submission_payload = JSON.parse(event.body).payload;
    const form_name = submission_payload.form_name;

    if (form_name === 'create-account') {
        const { displayName, firstName, lastName, nickname, userEmail, userNicename, userLogin, userPass, userUrl } = submission_payload
        console.log("submission_payload", submission_payload);
        
        const params = {
            displayName: displayName, 
            firstName: firstName, 
            lastName: lastName, 
            nickname: nickname, 
            userEmail: userEmail, 
            userNicename: userNicename, 
            userLogin: userLogin, 
            userPass: userPass,
            userUrl: userUrl
        }
        const res = await axios.put(apiBaseUrl + 'users/create', params)

        console.log("put response data", res.data);
    }
}