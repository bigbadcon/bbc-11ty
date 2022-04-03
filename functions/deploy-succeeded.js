const axios = require('axios');

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  
  if (event.body) {
    const payload = JSON.parse(event.body).payload
    
    // Only allow POST
    // if (event.httpMethod !== "POST") {
    //   return { statusCode: 405, body: "Method Not Allowed" };
    // }
    
    try {
      
      // Send message with link to Slack
      await axios.post(process.env.SLACK_WEBHOOK_URL, { text: `${payload.title} build has successfully depoloyed. Preview permalink: ${payload.links.permalink}` })
      
      return {
        statusCode: 200,
        body: `The deploy message for ${payload.title} has been sent to Slack 👋`,
      }
      
    } catch(error) {
      return {
        statusCode: 422,
        body: `Oops! Something went wrong. ${error}`,
      }
    }
  } else {
    return {
      statusCode: 422,
      body: `missing event.body`,
    }
  }
  
}