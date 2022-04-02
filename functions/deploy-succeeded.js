
// const { URL } = process.env
// URL === your site URL

exports.handler = async (event, context) => {
  
  console.log('deploy-succeeded')
  console.log('event', event)
  console.log('context', context)
  if (event.body) {
    let pubData = await JSON.parse(event.body);
    console.log('payload',pubData.payload);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: 'yay'
    })
  }
}