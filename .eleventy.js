const blogTools = require("eleventy-plugin-blog-tools");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
const Image = require("@11ty/eleventy-img");
const { google, outlook, office365, yahoo, ics } = require("calendar-link");
const windows1252 = require('windows-1252');
const utf8 = require('utf8')

/* -------------------------------------------------------------------------- */
/*                              Useful Functions                              */
/* -------------------------------------------------------------------------- */

/* ---------------- Get Duration Between Two Javascript Dates --------------- */
function getDuration( dateStart, dateEnd, accuracy = "minutes") {
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

/* ----- Sort by order frontmatter field then by fileSlug alphabetically ---- */
function sortByOrder(a,b) {
  return a.template.frontMatter.data.order - b.template.frontMatter.data.order || a.template.fileSlugStr.localeCompare(b.template.fileSlugStr)
}

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = text => {
  return utf8.decode(windows1252.encode(text))
}

/* --------------------------- Create Date Object --------------------------- */
// TODO: make sure this is right with Daylite Savings Time

function createDateObject (date, time) {
  return dayjs(date + "T" + time + "-07:00").toDate()
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

   // Staff sorted by order number and then alphabetically
   eleventyConfig.addCollection("blogPublished", function(collectionApi) {
    return collectionApi.getFilteredByTag("blog").filter(c => c.template.frontMatter.data.published === true);
  });

  // Staff sorted by order number and then alphabetically
  eleventyConfig.addCollection("staff123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Staff Emeritus sorted by order number and then alphabetically
  eleventyConfig.addCollection("staffEmeritus123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff-emeritus").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Staff sorted by order number and then alphabetically
  eleventyConfig.addCollection("pocscholar123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("poc-scholar").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Staff sorted by order number and then alphabetically
  eleventyConfig.addCollection("pocTeam123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("poc-team-member").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("cards123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("cards").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Big Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("bigcards123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("bigcards").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("footer123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("footer").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

/* -------------------------------------------------------------------------- */
/*                                   Filters                                  */
/* -------------------------------------------------------------------------- */

  // Format date for Blog list
  eleventyConfig.addFilter( "formatBlogDate", (date) => dayjs(date).format("MMM D, YYYY"));

  // Format date for event start
  const tz= 'America/Los_Angeles'
  eleventyConfig.addFilter( "formatEventDate", (date) => "<span style='white-space: nowrap;'>" + dayjs(date).tz(tz).format('MMM D, YYYY') + "</span> <span>" + dayjs(date).tz(tz).format('h:mm a') + "</span>");

  // Remove seconds from times
  eleventyConfig.addFilter( "stripSeconds", (val) => val.slice(0,5));

  // Convert unix time to ISO format
  eleventyConfig.addFilter("unixToISO", (date) => new Date(date).toISOString());

  // eventStartDateTime
  eleventyConfig.addFilter("eventStartDateTime", (event) => createDateObject(event.eventStartDate, event.eventStartTime));
  
  // event Duration
  eleventyConfig.addFilter("eventDuration", (event) => {
    const eventStartDateTime = createDateObject(event.eventStartDate, event.eventStartTime)
    const eventEndDateTime = createDateObject(event.eventEndDate, event.eventEndTime)
    return getDuration(eventStartDateTime,eventEndDateTime)
  });
  
  // event year
  eleventyConfig.addFilter("eventYear", (event) => event.eventStartDate.slice(0,4));

  // decode text
  eleventyConfig.addFilter("decodeText", (text) => decodeText(text))
  
  // Add date for og cachebuster
  eleventyConfig.addFilter("ogCacheBuster", (text) => {
    const today = new Date();
    const date = dayjs(today).format("YYYYMMDDHHmm");
    return text + "_" + date
  })

  eleventyConfig.addFilter('sortEvents', function(events) {
    if (events) return events.sort((a,b) => {
      const aEventStartDateTime = createDateObject(a.eventStartDate, a.eventStartTime)
      const bEventStartDateTime = createDateObject(b.eventStartDate, b.eventStartTime)
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


  // SVG Sprite Shortcode
  eleventyConfig.addShortcode("icon", function(icon = "star", fill="fill-highlight") {
    return `<span class="icon"><svg class="iconlink__icon ${fill}">
      <use xlink:href="/static/images/icons.svg#${icon}"></use>
    </svg></span>`
  });

  // SVG Sprite Link Shortcode
  eleventyConfig.addShortcode("iconLink", function(link, title, icon = "star", fill="fill-highlight") {
    // check for markdown link due to Forestry WYSIWYG issue
    if (link.startsWith("[")) link = link.match( /\[(.*)\]/)[1];
    return `<a href="${link}" class="iconlink"><svg class="iconlink__icon ${fill}">
      <use xlink:href="/static/images/icons.svg#${icon}"></use>
    </svg><span class="iconlink__title">${title}</span></a>`
  });

  /* -------- Convert metadata array to object to make it easier to use ------- */
  function metadataArrayToObject(arr) {
    const object = arr.reduce(function(result, item) {
      result[item.metaKey] = item.metaValue;
      return result;
    }, {});
    return object
  }

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
  })

  // Pass "static" things straight through from "src" to "dist"
  eleventyConfig.addPassthroughCopy("./src/static/");
  eleventyConfig.addPassthroughCopy("./images/");
  eleventyConfig.addPassthroughCopy({"./src/assets/svgs" : "/static/svgs"});

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
