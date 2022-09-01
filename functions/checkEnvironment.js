require('dotenv').config();
exports.handler = async function(event, context) {
    const buildContext = process.env.CONTEXT
    const ELEVENTY_ENV = process.env.ELEVENTY_ENV
    return {
        statusCode: 200,
        body: `CONTEXT: ${buildContext} ELEVENTY_ENV: ${ELEVENTY_ENV}`
    }
}