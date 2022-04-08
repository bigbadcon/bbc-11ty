const axios = require('axios');

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  
  // event.body is undefined when run with netlify cli locally so skip this.
  if (event.body) {
    const payload = JSON.parse(event.body).payload
    
    console.log('payload title',payload.title)
    console.log('payload permalink',payload.links.permalink)
    
    try {
      
      console.log("try send to Slack")
      
      // Send message with link to Slack
      await axios.post(process.env.SLACK_WEBHOOK_WEB_DEV, { text: `🎉 New build!\n🛠 ${payload.title}\n👁 Preview permalink: ${payload.links.permalink}` })
      
      console.log(`The deploy message for change '${payload.title}' has been sent to Slack`)
      
      return {
        statusCode: 200,
        body: `The deploy message for change '${payload.title}' has been sent to Slack 👋`,
      }
      
    } catch(error) {
      
      console.log(`Oops! Something went wrong trying to POST to ${process.env.SLACK_WEBHOOK_WEB_DEV}. ${error}`)
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