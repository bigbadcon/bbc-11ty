const axios = require('axios');

// const apiBaseUrl = 'http://www.logictwine.com:8092/'
const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

exports.handler = async function(event, context) {

    const {email} = event.queryStringParameters
    console.log(email);

    const body = {
        "emailAddress": email,
        "emailBody": "Hello, A request has been made to reset the password for the email address [emailAddress]. If you did not make this request you can ignore this email. If you did make this request then use the following link to create a new password https://www.bigbadcon.com/change-password/?uuid=[uuid]",
        "emailSubject": "Big Bad Con Password Reset"
    }
    
    const headers = { headers: {"x-api-key": apiKey} }
    console.log(headers, body);
    try {

        const res = await axios.post(apiBaseUrl + `password/request`, body, headers)

        if (res.status === 200) {
            return {
                statusCode: 200,
                body: "forgot password email sent",
            }
        } else {
            return {
                statusCode: 500,
                body: "failed"
            }
        }
    } catch (err) {
        console.log("password reset failed", err.response.config.url, err.response.status);
        return {
            statusCode: 200,
            body: "password reset failed"
        }
    }
}