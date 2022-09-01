require('dotenv').config();
exports.handler = async function(event, context) {
    const buildContext = process.env.CONTEXT
    const NETLIFY = process.env.NETLIFY
    return {
        statusCode: 200,
        body: `CONTEXT: ${buildContext} NETLIFY: ${NETLIFY}`
    }
}