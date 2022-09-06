const Cache = require("@11ty/eleventy-cache-assets");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')
// const rootCas = require('ssl-root-cas').create();
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
const environment = process.env.CONTEXT

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = text => {
    return utf8.decode(windows1252.encode(text))
}

/* ---------------------------- Main url for API ---------------------------- */

const url = "https://admin.bigbadcon.com:8091/api/events/all/public"
// const url = "https://admin.bigbadcon.com/apidev/events/all/public"

/* -------- Convert metadata array to object to make it easier to use ------- */
function metadataArrayToObject(arr) {
    const object = arr.reduce(function(result, item) {
      result[item.metaKey] = item.metaValue;
      return result;
    }, {});
    return object
}


/* -------------------------------------------------------------------------- */
/*                                 Main Export                                */
/* -------------------------------------------------------------------------- */

module.exports = async () => {
    try {
        let data = await Cache(url, {
            duration: "1d",
            type: "json"
        });

        /* -------------- Filter out unpublished events by eventStatus -------------- */
        // TODO: figure out a better way to handle this for main vs drafts
        // 0: draft or pending, 1: published, -1: trashed
        // TODO: issue found is that eventStatus = null when it is moved to trash back to drafts?
        if (environment === "production") data = data.filter(event => event.eventStatus === 1);
        // TODO: fix this as it is a kludge as we are hard coding the date
        data = data.filter(event => dayjs(event.eventStartDate).isAfter(dayjs('2022-09-01')));

        /* ---------------- fix data if missing slug and decode text ---------------- */
        data = data.map(event => {
            // if it is missing the eventSlug then use the eventId
            if (!event.eventSlug) event.eventSlug = event.eventId.toString()

            // Convert metadata array to a more usable keyed object
            let metadata = metadataArrayToObject(event.metadata)
            // decode GM field text to proper format
            // TODO: refactor so that both this and the past events works the same? Right now we convert this to an object here but with past events we use a filter. Might be nice if we did it on the server API side though.
            metadata = {...metadata, GM: (metadata.GM) && decodeText(metadata.GM), System: (metadata.System) && decodeText(metadata.System) }

            // Create Javascript date objects
            const eventStartDateTime = dayjs(event.eventStartDate + "T" + event.eventStartTime + "-07:00").toDate()
            const eventEndDateTime = dayjs(event.eventEndDate + "T" + event.eventEndTime + "-07:00").toDate()

            const arrayToStringForAlpine = () => event.categories.map(item => "'" + item.name + "'").toString()
 
            return {
                ...event,
                eventName: decodeText(event.eventName), // change to proper format
                postContent: decodeText(event.postContent),// change to proper format
                metadata: metadata, // replace with keyed object
                eventStartDateTime: eventStartDateTime, // native javascript date object
                eventEndDateTime: eventEndDateTime, // native javascript date object
                eventSlug: event.eventSlug.toLowerCase(), // force lowercase
                categories: event.categories.map(val => val.name) // convert to simple array
            }
        })

        /* ------------------ Separate Events from Volunteer shifts ----------------- */
        const events = data.filter(event => !event.categories.some(category => category === "Volunteer Shift"))
        // console.log(events);
        const volunteer = data.filter(event => event.categories.some(category => category === "Volunteer Shift"))

        /* ------------------- Sort by start time& alphabetically ------------------- */
        // TODO: why is alphabetically not sorting right
        function eventSort(events) {
            return events.sort((a,b) => a.eventStartDateTime - b.eventStartDateTime || a.eventName.localeCompare(b.eventName))
        }

        /* ------------------- Return object with events separated ------------------ */
        return {
            events: eventSort(events),
            volunteer: eventSort(volunteer)
        }

    } catch(error) {
        console.log('error',error)
        return {
            events: [],
            volunteer: [],
        }
    }
}