const axios = require('axios');

// const apiBaseUrl = 'http://www.logictwine.com:8092/'
// const apiBaseUrl = 'https://admin.bigbadcon.com:8091/api'
//const apiBaseUrl = 'https://api-dev.goplaynw.org/'
const apiBaseUrl = `${process.env.API_BASE_URI}`

const apiKey = `ApiKey ${process.env.BBC_API_KEY}`
// headers: {"x-api-key": apiKey}

exports.handler = async function (event, context) {

    if (event.httpMethod === 'POST') {
        // grab all queries

        const eventBody = JSON.parse(event.body)
        const {
            authToken,
            additionalGms,
            additionalRequirements,
            characters,
            contentAdvisory,
            eventCategoryId,
            eventDescription,
            eventFacilitators,
            eventMetadataIds,
            eventName,
            gm,
            gmAge,
            length,
            minPlayers,
            otherInfo,
            playerAge,
            players,
            playtest,
            requestMediaEquipment,
            requestMediaRoom,
            requestPrivateRoom,
            runNumberOfTimes,
            safetyTools,
            schedulingPref,
            system,
            tableType,
            triggerWarnings,
            userDisplayName,
            eventImage
        } = eventBody

        const headers = {
            'Content-Type': 'application/json;charset=utf-8',
            // Authorization: authToken,
            "x-api-key": apiKey
        }

        const body = {
            additionalGms,
            additionalRequirements,
            characters,
            contentAdvisory,
            eventCategoryId,
            eventDescription,
            eventFacilitators,
            eventMetadataIds,
            eventName,
            gm,
            gmAge,
            length,
            minPlayers,
            otherInfo,
            playerAge,
            players,
            playtest,
            requestMediaEquipment,
            requestMediaRoom,
            requestPrivateRoom,
            runNumberOfTimes,
            safetyTools,
            schedulingPref,
            system,
            tableType,
            triggerWarnings,
            userDisplayName,
            eventImage
        }

        // const headers = { headers: {"x-api-key": apiKey} }
        console.log(headers, body);
        try {

            const res = await axios.post(apiBaseUrl + `/events/create`, body, headers)

            if (res.status === 200) {
                if (event.eventImage != null) {
                    const imgRes = await axios.post(apiBaseUrl + `/events/image`, body.eventImage, headers)
                    if (imgRes.status === 500) {
                        return {
                            statusCode: 500,
                            body: `events/image (image upload) failed for ${eventName}`
                        }
                    }
                    return {
                        statusCode: 200,
                        body: `events/create sent for ${eventName}`,
                    }
                } else {
                    return {
                        statusCode: 500,
                        body: `events/create failed for ${eventName}`
                    }
                }
            }
        } catch (err) {
            console.log("events/create failed", err.response.config.url, err.response.status);
            return {
                statusCode: 500,
                body: `events/create failed for ${eventName}`
            }
        }
    } else {
        return {
            statusCode: 500,
            body: `only POST events are allowed`
        }
    }

}