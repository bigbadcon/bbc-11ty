const Cache = require("@11ty/eleventy-cache-assets");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')
const slugify = require('slugify')

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = text => {
    return utf8.decode(windows1252.encode(text))
}

/* ---------------------------- Main url for API ---------------------------- */
// TODO: change this for production use

const url = "http://www.logictwine.com:8092/events/all/public"

/* -------- Convert metadata array to object to make it easier to use ------- */
function metadataArrayToObject(arr) {
    const object = arr.reduce(function(result, item, index, array) {
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
        let data = await Cache(url,{
            duration: "1d",
            type: "json"
        });

        /* -------------- Filter out unpublished events by eventStatus -------------- */
        data = data.filter(entry => entry.eventStatus === 1);

        /* ---------------- fix data if missing slug and decode text ---------------- */
        data = data.map(entry => {
            if (!entry.eventSlug || entry.eventSlug === "") entry = {...entry, eventSlug: slugify(entry.eventName,{strict: true})}
            return {
                ...entry,
                eventName: decodeText(entry.eventName),
                postContent: decodeText(entry.postContent),
                metadata: metadataArrayToObject(entry.metadata)
            }
        })

        /* -------------------- Function to check for categories -------------------- */
        function hasCategory(entry, type) {
            return entry.categories.some(category => category.slug === type)
        }
        /* ------------------ Seperate Events from Volunteer shifts ----------------- */
        const events = data.filter(entry => !hasCategory(entry, "volunteer-shift"))
        const volunteer = data.filter(entry => hasCategory(entry, "volunteer-shift"))

        /* ------------------------------ Sort by start time ------------------------------ */
        function timeSort(array) {
            return array.sort((a,b) => {
                let fa = a.eventStartTime,
                    fb = b.eventStartTime;
    
                if (fa < fb) return -1;
                if (fa > fb) return 1;
            })
        }

        /* ------------------- Return object with events seperated ------------------ */
        return {
            events: timeSort(events),
            volunteer: timeSort(volunteer)
        }

    } catch(error) {
        console.log(error)
    }
}