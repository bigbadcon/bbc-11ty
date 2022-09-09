const axios = require('axios');
require('dotenv').config();

//const apiBaseUrl = 'https://api-dev.goplaynw.org/'
const apiBaseUrl = `${process.env.API_BASE_URI}`
const apiKey = `ApiKey ${process.env.BBC_API_KEY}`

exports.handler = async function(event, context) {

    if (event.httpMethod === 'POST') {
        /* -------------------------------------------------------------------------- */
        /*                        1. grab submitted event data                        */
        /* -------------------------------------------------------------------------- */

        // event body is formData
        const body = event.body
        console.log("🚀 ~ file: submit-event-image.js ~ line 16 ~ exports.handler=function ~ body", body)

        /* -------------------------------------------------------------------------- */
        /*                        2. upload to BBC                       */
        /* -------------------------------------------------------------------------- */
        
        const headers = { headers: {"x-api-key": apiKey, "Content-Type": "multipart/form-data",} }
        try {
    
            const res = await axios.post(apiBaseUrl + `events/image`, body, headers)
            console.log("🚀 ~ file: submit-event-image.js ~ line 25 ~ exports.handler=function ~ res", res)
    
            if (res.status === 200) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({msg:'Image Upload Success!'}),
                }
            } else {
                return {
                    statusCode: 500,
                    body: JSON.stringify({msg:'Image Upload Failed!'}),
                }
            }
        } catch (err) {
            console.log("Image Upload Failed", err.response.config.url, err.response.status, err);
            return {
                statusCode: 200,
                body: JSON.stringify({msg:'Image Upload Failed!'}),
            }
        }

    } else {
        return {
            statusCode: 500,
            body: `only POST events are allowed`
        }
    }
}