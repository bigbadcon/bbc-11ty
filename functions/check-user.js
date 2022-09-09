const axios = require('axios');

// const apiBaseUrl = 'http://www.logictwine.com:8092/'

// const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

//const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api/'
//const apiBaseUrl = 'https://api-dev.goplaynw.org/'
const apiBaseUrl = `${process.env.API_BASE_URI}`

const username = process.env.ADMIN_LOGIN
const password = process.env.ADMIN_PASSWORD

exports.handler = async function(event, context) {
    // https://[domain.com]/.netlify/functions/check-user/[userNicename]
    const path = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, '')
    let [userNicename] = (path) ? path.split('/') : []

    let token = null

    try {
        const authRes = await axios.post(apiBaseUrl + "login", { username: username, password: password })
        if (authRes.status === 200 && authRes.headers.authorization) {
            token = authRes.headers.authorization
        }
    } catch (err) {
        console.log("login failed", err.response.config.url, err.response.status);
    }

    try {
        const config = { headers: { Authorization: token } }

        const usersRes = await axios.get(apiBaseUrl + `users/username/${userNicename}`, config)

        if (usersRes.status === 200) {
            return {
                statusCode: 200,
                body: "user exists",
            }
        } else {
            return {
                statusCode: 500,
                body: "failed"
            }
        }
    } catch (err) {
        console.log("users check failed", err.response.config.url, err.response.status);
        return {
            statusCode: 200,
            body: "users check failed"
        }
    }
}