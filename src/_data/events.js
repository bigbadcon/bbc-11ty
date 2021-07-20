const Cache = require("@11ty/eleventy-cache-assets");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')
const slugify = require('slugify')

const decodeText = text => {
    return utf8.decode(windows1252.encode(text))
}

const url = "http://www.logictwine.com:8092/events/all/public"

module.exports = async () => {
    try {
        let data = await Cache(url,{
            duration: "1d",
            type: "json"
        });

        /* ---------------- fix data if missing slug and decode text ---------------- */
        data = data.map(entry => {
            if (!entry.eventSlug || entry.eventSlug === "") entry = {...entry, eventSlug: slugify(entry.eventName,{strict: true})}
            return {
                ...entry,
                eventName: decodeText(entry.eventName),
                postContent: decodeText(entry.postContent)
            }
        })

        /* ------------------------------ Sort by start time ------------------------------ */

        data = data.sort((a,b) => {
            let fa = a.eventStartTime,
                fb = b.eventStartTime;

            if (fa < fb) return -1;
            if (fa > fb) return 1;
        })

        return data

    } catch(error) {
        console.log(error)
    }
}