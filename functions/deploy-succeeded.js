const querystring = require("querystring");
const fetch = require("node-fetch");

// const { URL } = process.env
// URL === your site URL

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  
  if (event.body) {
    const payload = JSON.parse(event.body).payload
    
    // Only allow POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    // When the method is POST, the name will no longer be in the event’s
    // queryStringParameters – it’ll be in the event body encoded as a queryString
    
    // Send message with link to Slack
    return fetch(process.env.SLACK_WEBHOOK_URL, {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text: `${payload.title} build has successfully depoloyed. Preview permalink: ${payload.links.permalink}` }),
    })
      .then(() => ({
        statusCode: 200,
        body: `The deploy message for ${payload.title} has been sent to Slack 👋`,
      }))
      .catch((error) => ({
        statusCode: 422,
        body: `Oops! Something went wrong. ${error}`,
      }));
      
  } else {
    return {
      statusCode: 422,
      body: `missing event.body`,
    }
  }
  
  
}