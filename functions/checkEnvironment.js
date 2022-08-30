require('dotenv').config();
exports.handler = async function(event, context) {
    console.log(process.env)
    const buildContext = process.env.CONTEXT
    const ELEVENTY_ENV = process.env.ELEVENTY_ENV
    console.log
    return {
        statusCode: 200,
        body: `CONTEXT: ${buildContext} ELEVENTY_ENV: ${ELEVENTY_ENV}`
    }
}