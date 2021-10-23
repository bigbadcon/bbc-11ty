const axios = require('axios');

// TODO: change to Prod API
// const apiBaseUrl = 'http://www.logictwine.com:8092/'
const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

exports.handler = async function(event, context) {
    // https://[domain.com]/.netlify/functions/change-password/[uuid]/[emailAddress]/[password]
    const path = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, '')
    let [uuid,emailAddress,password] = (path) ? path.split('/') : []

    const body = {
        "emailAddress": emailAddress,
        "password": password,
        "uuid": uuid
    }
    const headers = { headers: {"x-api-key": apiKey} }

    try {

        const res = await axios.post(apiBaseUrl + `password/reset`, body, headers)

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