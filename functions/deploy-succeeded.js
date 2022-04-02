const fetch = require('node-fetch')
const { URL } = process.env
// URL === your site URL

// const functionOne = `${URL}/.netlify/functions/check-registration/493/colinaut/`
// const functionTwo = `${URL}/.netlify/functions/screenshot/online-interactive-fiction-collaborative-storytelling-games/`

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  console.log('event', event)
  console.log('context', context)

  // Ping serverless functions to renew cache
  // TODO: do I still need this?
  // const pingOne = await fetch(functionOne)
  // const pingTwo = await fetch(functionTwo)
  
  
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: 'yay'
    })
  }
}