const { App, ExpressReceiver } = require('@slack/bolt');
require('dotenv').config();
const axios = require('axios');

function parseRequestBody(stringBody, contentType) {
    try {
        if (!stringBody) {
            return "";
        }

        let result = {};

        if (contentType && contentType === "application/json") {
            return JSON.parse(stringBody);
        }

        let keyValuePairs = stringBody.split("&");
        keyValuePairs.forEach(function (pair) {
            let individualKeyValuePair = pair.split("=");
            result[individualKeyValuePair[0]] = decodeURIComponent(individualKeyValuePair[1] || "");
        });
        return JSON.parse(JSON.stringify(result));

    } catch {
        return "";
    }
}

const expressReceiver = new ExpressReceiver({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    processBeforeResponse: true
});

const app = new App({
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    token: `${process.env.SLACK_BOT_TOKEN}`,
    receiver: expressReceiver
});

async function sendChat(body,text) {
    await app.client.chat.postEphemeral({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.channel_id,
        text: text ,
        user: body.user_id
    });
}

app.command('/website', async({body, ack}) => {
    ack();
    const buildHookUrl = `https://api.netlify.com/build_hooks/${process.env.NETLIFY_BUILD_HOOK_SLACKBOT}`
    //  trigger different functions with parameters
    if (body.text === '') await sendChat(body, `Hi ${body.user_name}! I'm the website bot! You can trigger a new Production build by typing "/website build" or a new Drafts branch by typing "/website drafts"`)
    if (body.text === 'build') {
        await sendChat(body, `Build command for Production initiated!`)
        try {
            await axios.post(`${buildHookUrl}?trigger_title=slackbot`, {})
            await sendChat(body, `Build commencing! It should be ready in a couple minutes at https://www.bigbadcon.com`)
        }
        catch(err) {
            await sendChat(body, `Sorry build command failed for some reason!`)
        }
    }
    if (body.text === 'drafts') {
        await sendChat(body, `Build command for Drafts branch initiated!`)
        try {
            await axios.post(`${buildHookUrl}?trigger_title=slackbot&trigger_branch=drafts`, {})
            await sendChat(body, `Build commencing! It should be ready in a couple minutes at https://drafts--hopeful-pike-1a02ec.netlify.app`)
        }
        catch(err) {
            await sendChat(body, `Sorry build command failed for some reason!`)
        }
    }

    if (body.text === 'publish') {
        // 1. get second text which should be the deployId
        await sendChat(body, `Publish command for deploy initiated!`)
        // 2. Send post request to publish that deploy using https://open-api.netlify.com/#operation/restoreSiteDeploy 
        const netlifyToken = `${process.env.NETLIFY_ACCESS}`
        const site_id = `${process.env.SITE_ID}`
        try {
            const res = await axios.post(`https://api.netlify.com/api/v1/sites/${site_id}/deploys`, {},{
                headers: {
                        Authorization: `Bearer ${netlifyToken}`
                    }
            })
            console.log(res.data)
            // await axios.post(`https://api.netlify.com/api/v1/sites/${site_id}/deploys/${deploy_id}/restore`, {})
            if (res.data && res.data.length && res.data[0].name) {
                await sendChat(body, `Latest deploy name is: ${res.data[0].name} and site_id: ${res.data[0].site_id}`)
            } else {
                await sendChat(body, `deploy call didn't work.);`)
            }
        }
        catch(err) {
            await sendChat(body, `Sorry publish command failed for some reason!`)
            console.log(err)
        }
    }

});

exports.handler = async function(event, context) {

    // grab payload from event body
    const payload = parseRequestBody(event.body, event.headers["content-type"]);
    // If it's ia url verification challenge then reply with challenge
    if(payload && payload.type && payload.type === 'url_verification') {
        return {
            statusCode: 200,
            body: payload.challenge
        };
    }

    const slackEvent = {
        body: payload,
        ack: async (response) => {
            return {
              statusCode: 200,
              body: (response !== null || response !== undefined) ? response : ""
            };
        }
    }

    await app.processEvent(slackEvent)

    return {
        statusCode: 200,
        body: ""
    };
}