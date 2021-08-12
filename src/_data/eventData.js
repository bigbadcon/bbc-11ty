const Cache = require("@11ty/eleventy-cache-assets");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')
const slugify = require('slugify')
const rootCas = require('ssl-root-cas').create();
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
  
/* ----- Inject cert to avoid the UNABLE_TO_VERIFY_LEAF_SIGNATURE error ----- */
rootCas.addFile('certs/bigbadcon-com-chain.pem')
require('https').globalAgent.options.ca = rootCas;

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = text => {
    return utf8.decode(windows1252.encode(text))
}

/* ---------------------------- Main url for API ---------------------------- */

const url = "https://bigbadcon.com:8091/api/events/all/public"

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
        // TODO: turn this filter on before we go live
        // data = data.filter(event => event.eventStatus === 1);

        /* ---------------- fix data if missing slug and decode text ---------------- */
        data = data.map(event => {
            if (!event.eventSlug || event.eventSlug === "") event = {...event, eventSlug: slugify(event.eventName,{strict: true})}
            let metadata = metadataArrayToObject(event.metadata)
            metadata = {...metadata, GM: (metadata.GM) ? decodeText(metadata.GM) : null}

            // Create Javascript date object
            const eventStartDateTime = dayjs(event.eventStartDate + "T" + event.eventStartTime + "-07:00").toDate()
            const eventEndDateTime = dayjs(event.eventEndDate + "T" + event.eventEndTime + "-07:00").toDate()
 
            return {
                ...event,
                eventName: decodeText(event.eventName),
                postContent: decodeText(event.postContent),
                metadata: metadata,
                eventStartDateTime: eventStartDateTime,
                eventEndDateTime: eventEndDateTime,
                eventSlug: event.eventSlug.toLowerCase(),
            }
        })

        /* -------------------- Function to check for categories -------------------- */
        function hasCategory(event, type) {
            return event.categories.some(category => category.slug === type)
        }
        /* ------------------ Seperate Events from Volunteer shifts ----------------- */
        const events = data.filter(event => !hasCategory(event, "volunteer-shift"))
        const volunteer = data.filter(event => hasCategory(event, "volunteer-shift"))

        /* ------------------- Sort by start time& alphabetically ------------------- */
        function eventSort(events) {
            return events.sort((a,b) => a.eventStartDateTime - b.eventStartDateTime || a.eventName.localeCompare(b.eventName))
        }

        /* ------------------- Return object with events seperated ------------------ */
        return {
            events: eventSort(events),
            volunteer: eventSort(volunteer)
        }

    } catch(error) {
        console.log(error)
    }
}