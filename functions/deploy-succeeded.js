const axios = require('axios');

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  
  if (event.body) {
    const payload = JSON.parse(event.body).payload
    
    console.log('payload title',payload.title)
    console.log('payload permalink',payload.links.permalink)
    
    try {
      
      // Send message with link to Slack
      await axios.post(process.env.SLACK_WEBHOOK_URL, { text: `${payload.title} build has successfully deployed. Preview permalink: ${payload.links.permalink}` })
      
      console.log(`The deploy message for ${payload.title} has been sent to Slack 👋`)
      
      return {
        statusCode: 200,
        body: `The deploy message for ${payload.title} has been sent to Slack 👋`,
      }
      
    } catch(error) {
      
      console.log(`Oops! Something went wrong trying to POST to ${process.env.SLACK_WEBHOOK_URL}. ${error}`)
      return {
        statusCode: 422,
        body: `Oops! Something went wrong. ${error}`,
      }
    }
  } else {
    console.log(`missing event.body`)
    return {
      statusCode: 422,
      body: `missing event.body`,
    }
    
  }
  
}