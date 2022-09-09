const axios = require('axios');

const apiBaseUrl = `${process.env.API_BASE_URI}`

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
const hostUri = `'${process.env.HOST_URI}`
// headers: {"x-api-key": apiKey}

exports.handler = async function(event, context) {

    const {email} = event.queryStringParameters
    console.log(email);

    const body = {
        "emailAddress": email,
        "emailBody": "Hello, A request has been made to reset the password for the email address [emailAddress]. If you did not make this request you can ignore this email. If you did make this request then use the following link to create a new password: " + hostUri + "/change-password/?uuid=[uuid]",
        "emailSubject": "Go Play NW Password Reset"
    }
    
    const headers = { headers: {"x-api-key": apiKey} }
    console.log(headers, body);
    try {

        const res = await axios.post(apiBaseUrl + `password/request`, body, headers)

        console.log("response status: " + res.status)

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