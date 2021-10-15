const fetch = require('node-fetch')
const { URL } = process.env
// URL === your site URL

const functionOne = `${URL}/.netlify/functions/check-registration/493/colinaut/`
const functionTwo = `${URL}/.netlify/functions/screenshot/online-interactive-fiction-collaborative-storytelling-games/`

exports.handler = async (event, context) => {

  // Modify fetch calls with your payloads (if needed)
  const pingOne = await fetch(functionOne)
  const pingTwo = await fetch(functionTwo)
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: 'yay'
    })
  }
}