const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_GAMES_ON_DEMAND

const Airtable = require('airtable');
const base = new Airtable({apiKey: apiKey}).base(baseId);

exports.handler = async function(event, context) {

    if (event.httpMethod === 'POST') {
        const eventBody = JSON.parse(event.body)
        console.log("🚀 ~ file: submit-games-on-demand.js ~ line 11 ~ exports.handler=function ~ eventBody", eventBody)

        // 1. Create a new record

        try {
            base('Submissions').create([
                {
                  "fields": eventBody
                }
            ], function(err, records) {
                if (err) {
                  console.error(err);
                  return;
                }
                records.forEach(function (record) {
                  console.log(record.getId());
                });
            });
            return {
                statusCode: 200,
                body: `success!`
            }
        } catch (e) {
            console.log('airtable try fail', e);
            return {
                statusCode: 500,
                body: `airtable try fail`
            }
        }
    } else {
        return {
            statusCode: 500,
            body: `only POST events are allowed`
        }
    }
}