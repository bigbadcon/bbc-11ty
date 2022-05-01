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
    if (body.text === '') await sendChat(body, `Hi ${body.user_name}! I'm the website bot! You can use the following slash commands:\n*/website build* triggers a new production build\n*/website drafts* triggers a new drafts branch build\n*/website publish* publishes the most recent deploy live`)
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
            const endpoint = `https://api.netlify.com/api/v1/sites/${site_id}/deploys`;
            const result = axios.post(`https://api.netlify.com/api/v1/sites/${site_id}/deploys`, {},{
                headers: {
                    Authorization: `Bearer ${netlifyToken}`
                }
            })

            
            console.log("slackbot publish: listSiteDeploy result",result)
            console.log("slackbot publish: listSiteDeploy result.data",result.data)
            if (result.data[0]) console.log("slackbot publish: listSiteDeploy result.data[0]",result.data[0])
            
    

            // const res = await axios.post(`https://api.netlify.com/api/v1/sites/${site_id}/deploys`, {},{
            //     headers: {
            //         Authorization: `Bearer ${netlifyToken}`
            //     }
            // })
            // console.log("slackbot publish: listSiteDeploy",res.data)
            // if (res.data && res.data.id) {
            //     await sendChat(body, `Deploy (deploy_id: ${res.data.id})`)
            //      let endpoint = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`;
            //     // const restoreRes = await axios.post(`https://api.netlify.com/api/v1/sites/${site_id}/deploys/${res.data.id}/restore`, {},{
            //     //     headers: {
            //     //         Authorization: `Bearer ${netlifyToken}`
            //     //     }
            //     // })
            //     // console.log("slackbot publish: listSiteDeploy",restoreRes)
            //     // if (restoreRes) { 
            //     //     await sendChat(body, `🎉 Latest deploy (deploy_id: ${res.data.id}) has been published live! https://www.bigbadcon.com`)
            //     // } else await sendChat(body, `netlify restoreSiteDeploy failed for some reason`)
            // } else {
            //     await sendChat(body, `Netlify listSiteDeploy api didn't work for some reason. Check slackbot.js function logs`)
            // }
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