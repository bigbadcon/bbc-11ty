const axios = require('axios');

// TODO: change to Prod API
const apiBaseUrl = `${process.env.API_BASE_URI}`

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

exports.handler = async function(event, context) {
    const {uuid,email,password} = event.queryStringParameters
    console.log(uuid,email,password);

    const body = {
        "emailAddress": email,
        "password": password,
        "uuid": uuid
    }
    const headers = { headers: {"x-api-key": apiKey} }

    try {

        const res = await axios.post(apiBaseUrl + `password/reset`, body, headers)

        console.log("response status: " + res.status)

        if (res.status === 200) {
            return {
                statusCode: 200,
                body: "password changed",
            }
        } else {
            return {
                statusCode: 500,
                body: "failed"
            }
        }
    } catch (err) {
        console.log("password change failed", err.response.config.url, err.response.status);
        return {
            statusCode: 200,
            body: "failed"
        }
    }

}