const Cache = require("@11ty/eleventy-cache-assets");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')
const slugify = require('slugify')
const rootCas = require('ssl-root-cas').create();
const format = require('date-fns/format');
const parse = require('date-fns/parse');
  
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
        // data = data.filter(entry => entry.eventStatus === 1);

        /* ---------------- fix data if missing slug and decode text ---------------- */
        data = data.map(entry => {
            if (!entry.eventSlug || entry.eventSlug === "") entry = {...entry, eventSlug: slugify(entry.eventName,{strict: true})}
            let metadata = metadataArrayToObject(entry.metadata)
            metadata = {...metadata, GM: (metadata.GM) ? decodeText(metadata.GM) : null}

            const eventStartDateTime = parse(entry.eventStartDate + entry.eventStartTime, "yyyy-MM-ddHH:mm:ss", new Date())
            const eventEndDateTime = parse(entry.eventEndDate + entry.eventEndTime, "yyyy-MM-ddHH:mm:ss", new Date())
 
            return {
                ...entry,
                eventName: decodeText(entry.eventName),
                postContent: decodeText(entry.postContent),
                metadata: metadata,
                eventStartDateTime: eventStartDateTime,
                eventEndDateTime: eventEndDateTime,
            }
        })

        /* -------------------- Function to check for categories -------------------- */
        function hasCategory(entry, type) {
            return entry.categories.some(category => category.slug === type)
        }
        /* ------------------ Seperate Events from Volunteer shifts ----------------- */
        const events = data.filter(entry => !hasCategory(entry, "volunteer-shift"))
        const volunteer = data.filter(entry => hasCategory(entry, "volunteer-shift"))

        /* ------------------- Sort by start time& alphabetically ------------------- */
        function eventSort(events) {
            return events.sort((a,b) => b.eventStartDateTime - a.eventStartDateTime || a.eventName.localeCompare(b.eventName))
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