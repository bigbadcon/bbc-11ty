const blogTools = require("eleventy-plugin-blog-tools");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
const duration = require('dayjs/plugin/duration') // dependent on utc plugin
const relativeTime = require('dayjs/plugin/relativeTime') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(relativeTime)
const Image = require("@11ty/eleventy-img");
const { google, outlook, office365, yahoo, ics } = require("calendar-link");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')

/* -------------------------------------------------------------------------- */
/*                              Useful Functions                              */
/* -------------------------------------------------------------------------- */

/* ---------------- Get Duration Between Two Javascript Dates --------------- */
function getHours( dateStart, dateEnd, accuracy = "minutes") {
  // calculate hours
  let diffInMilliSeconds = Math.abs(dateEnd - dateStart) / 1000;
  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;

  // calculate minutes
  diffInMilliSeconds -= hours * 3600;
  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
  const minutesString = (minutes < 10) ? `0${minutes.toString()}` : minutes.toString();

  // calculate seconds
  diffInMilliSeconds -= minutes * 60;

  if (accuracy === "hours") return `${hours.toString()}`;
  if (accuracy === "minutes") return `${hours.toString()}:${minutesString}`;
  return false
}

const getDurationInHours = (dateStart,dateEnd) => {
  dateStart = new Date(dateStart)
  dateEnd = new Date(dateEnd)
  return (Math.abs(dateEnd - dateStart) / 1000) / 3600 % 24;
}

function hoursToHHMM(hours) {
  var h = String(Math.trunc(hours)).padStart(2, '0');
  var m = String(Math.abs(Math.round((hours - h) * 60))).padStart(2, '0');
  return h + ':' + m;
}

/* ----- Sort by order frontmatter field then by fileSlug alphabetically ---- */
function sortByOrder(a,b) {
  return a.data.order - b.data.order || a.template.fileSlugStr.localeCompare(b.template.fileSlugStr)
}

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = text => {
  return utf8.decode(windows1252.encode(text))
}

/* --------------------------- Create Date Object --------------------------- */
const tz = 'America/Los_Angeles'

function createISODate (date, time) {
  return dayjs(date + "T" + time).tz(tz).toISOString()
}

/* -------------------------------------------------------------------------- */
/*                     eleventyConfig Module Exports                          */
/* -------------------------------------------------------------------------- */

module.exports = (eleventyConfig) => {

  // See if this helps with things that do not refresh
  module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Markdown It                                */
  /* -------------------------------------------------------------------------- */

  const markdownIt = require('markdown-it')
  const markdownItAttrs = require('markdown-it-attrs')

  const markdownItOptions = {
    html: true,
    linkify: true
  }

  const markdownLib = markdownIt(markdownItOptions).use(markdownItAttrs)
  eleventyConfig.setLibrary('md', markdownLib)

  /* -------------------------------------------------------------------------- */
  /*                                   Plugins                                  */
  /* -------------------------------------------------------------------------- */

  eleventyConfig.addPlugin(blogTools);
  eleventyConfig.addPlugin(pluginRss);

  /* -------------------------------------------------------------------------- */
  /*                                 Collections                                */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                         Main Nav special collection                        */
  /* -------------------------------------------------------------------------- */

  const navGroups = ["Attend","Events","Volunteer","Community","Blog"]

  eleventyConfig.addCollection("nav", function(collectionApi) {
    const allNav = collectionApi.getAll().filter(c => c.data.navGroup).filter(c => c.data.published !== false)
    const tempArray = allNav.map(c => {
      return {
        group: c.data.navGroup,
        title: c.data.navTitle || c.data.title,
        order: c.data.order,
        icon: c.data.icon,
        url: c.url
      }
    })

    let navArray = {}

    navGroups.forEach(g => {
      const group = tempArray.filter(item => item.group === g)
      if (group.length > 0) {
        navArray[g] = group.sort((a,b) => a.order - b.order || a.title.localeCompare(b.title))
      }
    })

    return navArray
  })


/* -------------------------------------------------------------------------- */
/*                                   Filters                                  */
/* -------------------------------------------------------------------------- */

/* --------------------------- Collections Filters -------------------------- */

eleventyConfig.addFilter( "published", (collection) => collection && collection.filter(c => c.data.published !== false ) )

eleventyConfig.addFilter( "sort", (collection) => collection && collection.sort((a,b) => sortByOrder(a,b)) )

/* ------------------------------ Date Filters ------------------------------ */

  // Format date for Blog list
  eleventyConfig.addFilter( "formatBlogDate", (date) => dayjs(date).format("MMM D, YYYY"));

  // Format date for event start
  const tz = 'America/Los_Angeles'

  eleventyConfig.addFilter( "unixtime", (date) => dayjs(date).tz(tz).unix())

  // Format date; used for event list
  eleventyConfig.addFilter( "formatDate", (date) => dayjs(date).tz(tz).format('MMM D'))

  // Format date with year
  eleventyConfig.addFilter( "formatDateWithYear", (date) => dayjs(date).tz(tz).format('MMM D, YYYY'))
  
  // Format time
  eleventyConfig.addFilter( "formatTime", (date) => dayjs(date).tz(tz).format('h:mma'))

  // Convert unix time to ISO format; used in sitemap
  eleventyConfig.addFilter("unixToISO", (date) => new Date(date).toISOString());

  // eventStartDateTime; used only in past events for now
  eleventyConfig.addFilter("eventStartDateTime", (event) => createISODate(event.eventStartDate, event.eventStartTime));
  
  // event Duration; Used only for past events for now
  eleventyConfig.addFilter("eventDuration", (event) => getDurationInHours(createISODate(event.eventStartDate, event.eventStartTime),createISODate(event.eventEndDate, event.eventEndTime)));
  
  //Used only for past events for now
  eleventyConfig.addFilter("hoursToHHMM", (hours) => hoursToHHMM(hours))
  
  // check to see if date is in the past; used for turning on/off parts based on date like the game booking
  eleventyConfig.addFilter("isPastDate", (date) => dayjs().isAfter(dayjs(date)));

  /* ------------------------------ Other Filters ----------------------------- */

  // slugify
  eleventyConfig.addFilter("slugify", text => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // separate accent from letter
      .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
      .replace(/\s+/g, '-') // replace spaces with dash
      .replace(/&/g, '-and-') // replace & with 'and'
      .replace(/[^\w-]+/g, '') // remove all non-word chars
      .replace(/--+/g, '-') // replace multiple dash with single
  })

  // decode text
  eleventyConfig.addFilter("decodeText", (text) => decodeText(text))
  
  // Add date for og cachebuster; used for css cache busting purposes
  eleventyConfig.addFilter("ogCacheBuster", (text) => {
    const today = new Date();
    const date = dayjs(today).format("YYYYMMDDHHmm");
    return text + "_" + date
  })

  // Sort events used for Event Archives Table for now
  eleventyConfig.addFilter('sortEvents', function(events) {
    if (events) return events.sort((a,b) => {
      const aEventStartDateTime = new Date(createISODate(a.eventStartDate, a.eventStartTime))
      const bEventStartDateTime = new Date(createISODate(b.eventStartDate, b.eventStartTime))
      return aEventStartDateTime - bEventStartDateTime;
    });
    return false;
  });

  // eventStartDateTime
  eleventyConfig.addFilter("convertCentsToDollars", (unit) => unit / 100);
  
  // convert any array fo strings to a string with single quotes for use in Alpine
  // this is used mainly for the events-table list of categories for filtering
  eleventyConfig.addFilter("alpineArray", (array) => array.map(item => "'" + item+ "'").toString())

  /* -------------------------------------------------------------------------- */
  /*                                 Shortcodes                                 */
  /* -------------------------------------------------------------------------- */

  // Event duration in hours
  eleventyConfig.addShortcode( "eventDuration", (dateStart, dateEnd, accuracy) => {
    // accuracy "hours" || "minutes"; Defaults to minutes
    return getDuration(dateStart,dateEnd,accuracy)
  });

  // Current Year
  eleventyConfig.addShortcode("currentYear", function () {
    const today = new Date();
    return today.getFullYear();
  });
  
  // Current Date
  eleventyConfig.addShortcode("currentDate", function () {
    const today = new Date();
    return dayjs(today).format("YYYYMMDD");
  });

  // Find Metadata Value By Key
  eleventyConfig.addShortcode("metaValue", function(metadata, key) {
    let value = Array.isArray(metadata) && metadata.find(item => item.metaKey === key ).metaValue
    if (value && key === "GM") value = decodeText(value)
    return value
  });

  /* ----------------------------- Image Shortcode ---------------------------- */

  async function imageShortcode(src, alt, sizes = "100vw", loading = "lazy") {
    try {
      let metadata = await Image(`.${src}`, {
        widths: [960],
        formats: ["webp", "png"],
        urlPath:"/event-images/",
        outputDir:"./dist/event-images/"
      }); 

      let imageAttributes = {
        alt,
        sizes,
        loading: loading,
        decoding: "async",
      };
      
      return Image.generateHTML(metadata, imageAttributes);

    } catch (e) {
      console.log(e)
      // return blank so no image appears if missing
      return ``
    }
    
  }

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  /* ------------------------- Calendar Link Shortcode ------------------------ */
  eleventyConfig.addShortcode("calendarLink", function (title, description, dateStart, dateEnd, type = "google") {
    const event = {
      title: title,
      description: description,
      start: dateStart,
      end: dateEnd,
      location: 'https://twitch.tv/bigbadcon',
      url: 'https://twitch.tv/bigbadcon'
    };

    if (type === "google") return google(event);
    if (type === "outlook") return outlook(event);
    if (type === "office365") return office365(event);
    if (type === "ics") return ics(event);
    if (type === "yahoo") return yahoo(event);
    return false
  });


  /* -------------------------------------------------------------------------- */
  /*                                 Build Stuff                                */
  /* -------------------------------------------------------------------------- */

  // Pass through 3rd party libraries
  eleventyConfig.addPassthroughCopy({
    "node_modules/alpinejs/dist/cdn.min.js" : "js/alpine.min.js",
    "node_modules/dayjs/dayjs.min.js" : "js/dayjs.min.js",
    "node_modules/dayjs/plugin/utc.js": "js/dayjs.utc.js",
    "node_modules/dayjs/plugin/timezone.js": "js/dayjs.timezone.js",
    "node_modules/lite-youtube-embed/src/lite-yt-embed.js": "js/lite-youtube-embed.js",
    "node_modules/lite-youtube-embed/src/lite-yt-embed.css": "css/lite-youtube-embed.css",
    "node_modules/array-flat-polyfill/index.js": "js/array-flat-polyfill.js",
    "node_modules/@alpinejs/persist/dist/cdn.min.js": "js/alpine.persist.min.js",
    "node_modules/@alpinejs/intersect/dist/cdn.min.js": "js/alpine.intersect.min.js",
    "node_modules/@colinaut/alpinejs-plugin-simple-validate/dist/alpine.validate.min.js": "js/alpine.validate.min.js",
    "node_modules/@colinaut/alpinejs-plugin-simple-validate/examples/alpine.validate.js": "js/alpine.validate.js",
    "node_modules/utf8/utf8.js": "js/utf8.js",
  })

  // Pass "static" things straight through from "src" to "dist"
  eleventyConfig.addPassthroughCopy("./src/static/");
  eleventyConfig.addPassthroughCopy("./images/");
  // eleventyConfig.addPassthroughCopy({"./src/assets/svgs" : "/static/svgs"});

  // Event images is a kludge until we can get it working with event manager
  eleventyConfig.addPassthroughCopy("./event-images/");

  // Watch for changes in tailwind css
  eleventyConfig.addWatchTarget("./src/tailwind/tailwind.css");
  eleventyConfig.addWatchTarget("./event-images");

  // Clarify which folder is for input and which folder is for output
  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
