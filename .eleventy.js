const blogTools = require("eleventy-plugin-blog-tools");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
const duration = require("dayjs/plugin/duration"); // dependent on utc plugin
const relativeTime = require("dayjs/plugin/relativeTime"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
const Image = require("@11ty/eleventy-img");
const { google, outlook, office365, yahoo, ics } = require("calendar-link");

// const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");

/* -------------------------------------------------------------------------- */
/*                              Useful Functions                              */
/* -------------------------------------------------------------------------- */

/* ---------------- Get Duration Between Two Javascript Dates --------------- */
function getHours(dateStart, dateEnd, accuracy = "minutes") {
	// calculate hours
	let diffInMilliSeconds = Math.abs(dateEnd - dateStart) / 1000;
	const hours = Math.floor(diffInMilliSeconds / 3600) % 24;

	// calculate minutes
	diffInMilliSeconds -= hours * 3600;
	const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
	const minutesString = minutes < 10 ? `0${minutes.toString()}` : minutes.toString();

	// calculate seconds
	diffInMilliSeconds -= minutes * 60;

	if (accuracy === "hours") return `${hours.toString()}`;
	if (accuracy === "minutes") return `${hours.toString()}:${minutesString}`;
	return false;
}

const getDurationInHours = (dateStart, dateEnd) => {
	dateStart = new Date(dateStart);
	dateEnd = new Date(dateEnd);
	return (Math.abs(dateEnd - dateStart) / 1000 / 3600) % 24;
};

function hoursToHHMM(hours) {
	var h = String(Math.trunc(hours));
	var m = String(Math.abs(Math.round((hours - h) * 60))).padStart(2, "0");
	return h + ":" + m;
}

function slugify(str) {
	return str
		.toString()
		.toLowerCase()
		.trim()
		.normalize("NFD") // separate accent from letter
		.replace(/[\u0300-\u036f]/g, "") // remove all separated accents
		.replace(/\s+/g, "-") // replace spaces with dash
		.replace(/&/g, "-and-") // replace & with 'and'
		.replace(/[^\w-]+/g, "") // remove all non-word chars
		.replace(/--+/g, "-"); // replace multiple dash with single
}

/* ----- Sort by order frontmatter field then by fileSlug alphabetically ---- */
function sortByOrder(a, b) {
	return a.data.order - b.data.order || a.template.fileSlugStr.localeCompare(b.template.fileSlugStr);
}

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = (text) => {
	try {
		const windows1252 = new TextEncoder("windows-1251");
		const utf8 = new TextDecoder();
		return text && utf8.decode(windows1252.encode(text));
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("decodeText: " + error);
		return text;
	}
};

/* --------------------------- Create Date Object --------------------------- */
const tz = "America/Los_Angeles";

function createISODate(date, time) {
	return dayjs(date + "T" + time)
		.tz(tz)
		.toISOString();
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

	const markdownIt = require("markdown-it");
	const markdownItAttrs = require("markdown-it-attrs");
	const markdownItAnchor = require("markdown-it-anchor");

	const markdownItOptions = {
		html: true,
		linkify: true,
	};

	const markdownLib = markdownIt(markdownItOptions)
		.use(markdownItAttrs)
		.use(markdownItAnchor, { slugify: (str) => slugify(str) });
	eleventyConfig.setLibrary("md", markdownLib);

	/* -------------------------------------------------------------------------- */
	/*                                   Plugins                                  */
	/* -------------------------------------------------------------------------- */

	eleventyConfig.addPlugin(blogTools);
	eleventyConfig.addPlugin(pluginRss);

	// eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
	// 	name: "serverless",
	// });

	/* -------------------------------------------------------------------------- */
	/*                                 Collections                                */
	/* -------------------------------------------------------------------------- */

	eleventyConfig.addCollection("blogPublished", function (collectionApi) {
		return collectionApi.getFilteredByTag("blog").filter((c) => c.data.published === true);
	});

	/* -------------------------------------------------------------------------- */
	/*                         Main Nav special collection                        */
	/* -------------------------------------------------------------------------- */

	// TODO: make this accessible from global configuration
	const navGroups = ["Attend", "Events", "Volunteer", "Community", "Donate"];

	eleventyConfig.addCollection("nav", function (collectionApi) {
		// console.log(collectionApi.getFilteredByTag("pages").map(c => c.data.title))
		const allNav = collectionApi
			.getAll()
			.filter((c) => c.data.navGroup)
			.filter((c) => c.data.published !== false);

		const tempArray = allNav.map((c) => {
			return {
				group: c.data.navGroup,
				title: c.data.navTitle || c.data.title,
				order: c.data.order,
				icon: c.data.icon,
				url: c.url,
			};
		});

		let navArray = {};

		navGroups.forEach((g) => {
			const group = tempArray.filter((item) => item.group === g);
			if (group.length > 0) {
				navArray[g] = group.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
			}
		});

		return navArray;
	});

	/* -------------------------------------------------------------------------- */
	/*                                   Filters                                  */
	/* -------------------------------------------------------------------------- */

	/* --------------------------- Collections Filters -------------------------- */

	eleventyConfig.addFilter(
		"published",
		(collection) => collection && collection.filter((c) => c.data.published !== false)
	);

	eleventyConfig.addFilter("sort", (collection) => collection && collection.sort((a, b) => sortByOrder(a, b)));

	/* ------------------------------ Date Filters ------------------------------ */

	// Format date for Blog list
	eleventyConfig.addFilter("formatBlogDate", (date) => dayjs(date).format("MMM D, YYYY"));

	// Format date for event start
	const tz = "America/Los_Angeles";

	eleventyConfig.addFilter("unixtime", (date) => dayjs(date).tz(tz).unix());

	// Format date; used for event list
	eleventyConfig.addFilter("formatDate", (date) => dayjs(date).tz(tz).format("MMM D"));

	// Format date with year
	eleventyConfig.addFilter("formatDateWithYear", (date) => dayjs(date).tz(tz).format("MMM D, YYYY"));

	// Format time
	eleventyConfig.addFilter("formatTime", (date) => dayjs(date).tz(tz).format("h:mma"));

	// Convert unix time to ISO format; used in sitemap
	eleventyConfig.addFilter("unixToISO", (date) => new Date(date).toISOString());

	// eventStartDateTime; used only in past events for now
	eleventyConfig.addFilter("eventStartDateTime", (event) =>
		createISODate(event.eventStartDate, event.eventStartTime)
	);

	// event Duration; Used only for past events for now
	eleventyConfig.addFilter("eventDuration", (event) =>
		getDurationInHours(
			createISODate(event.eventStartDate, event.eventStartTime),
			createISODate(event.eventEndDate, event.eventEndTime)
		)
	);

	eleventyConfig.addFilter("isBeforeDate", function (date) {
		if (dayjs(date).isValid()) {
			const isBeforeDate = dayjs().isBefore(dayjs(date));
			return isBeforeDate;
		} else {
			console.log("ERROR: isBeforeDate has Invalid date");
			return null;
		}
	});

	eleventyConfig.addFilter("isAfterDate", function (date) {
		if (dayjs(date).isValid()) {
			const isAfterDate = dayjs().isAfter(dayjs(date));
			return isAfterDate;
		} else {
			console.log("ERROR: isAfterDate has Invalid date");
			return null;
		}
	});

	//Used only for past events for now
	eleventyConfig.addFilter("hoursToHHMM", (hours) => hoursToHHMM(hours));

	/* ------------------------------ Other Filters ----------------------------- */

	// slugify
	eleventyConfig.addFilter("slugify", (str) => slugify(str));

	// decode text
	eleventyConfig.addFilter("decodeText", (text) => decodeText(text));

	// Add date for og cachebuster; used for css cache busting purposes
	eleventyConfig.addFilter("ogCacheBuster", (text) => {
		const today = new Date();
		const date = dayjs(today).format("YYYYMMDDHHmm");
		return text + "_" + date;
	});

	// Sort events used for Event Archives Table for now
	eleventyConfig.addFilter("sortEvents", function (events) {
		if (events)
			return events.sort((a, b) => {
				const aEventStartDateTime = new Date(createISODate(a.eventStartDate, a.eventStartTime));
				const bEventStartDateTime = new Date(createISODate(b.eventStartDate, b.eventStartTime));
				return aEventStartDateTime - bEventStartDateTime;
			});
		return false;
	});

	// eventStartDateTime
	eleventyConfig.addFilter("convertCentsToDollars", (unit) => unit / 100);

	// convert any array fo strings to a string with single quotes for use in Alpine
	// this is used mainly for the events-table list of categories for filtering
	eleventyConfig.addFilter("alpineArray", (array) => array.map((item) => "'" + item + "'").toString());

	// Mastodon link filter
	eleventyConfig.addFilter("mastodonLink", (handle) => {
		const mastodon = handle.split("@");
		return `https://${mastodon[2]}/@${mastodon[1]}`;
	});

	// TODO: fix this
	// Bluesky link filter
	// https://bsky.app/profile/seannittner.bsky.social
	eleventyConfig.addFilter("blueskyLink", (handle) => {
		return `https://bsky.app/profile/${handle}`;
	});

	/* -------------------------------------------------------------------------- */
	/*                                 Shortcodes                                 */
	/* -------------------------------------------------------------------------- */

	/* -------------------------- Date Time Shortcodes -------------------------- */

	// Event duration in hours
	eleventyConfig.addShortcode("eventDuration", (dateStart, dateEnd, accuracy) => {
		// accuracy "hours" || "minutes"; Defaults to minutes
		return getDuration(dateStart, dateEnd, accuracy);
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

	// Current Date
	eleventyConfig.addShortcode("currentDateUNIX", function () {
		const today = new Date();
		return dayjs(today).unix();
	});

	eleventyConfig.addShortcode("dateRange", function (start, end) {
		if (dayjs(start).isValid() && dayjs(end).isValid()) {
			const dateRange = `${dayjs(start).format("MMM D")} - ${dayjs(end).format("MMM D")} ${dayjs(start).format(
				"YYYY"
			)}`;
			return dateRange;
		} else {
			console.log("ERROR: dateRange has Invalid date");
			return null;
		}
	});

	/* ----------------------------- Other Shortcuts ---------------------------- */

	// Find Metadata Value By Key
	eleventyConfig.addShortcode("metaValue", function (metadata, key) {
		let value = Array.isArray(metadata) && metadata.find((item) => item.metaKey === key).metaValue;
		if (value && key === "GM") value = decodeText(value);
		return value;
	});

	/* ----------------------------- Image Shortcode ---------------------------- */

	async function imageShortcode(src, alt, sizes = "100vw", loading = "lazy") {
		try {
			let metadata = await Image(`.${src}`, {
				widths: [960],
				formats: ["webp", "png"],
				urlPath: "/event-images/",
				outputDir: "./dist/event-images/",
			});

			let imageAttributes = {
				alt,
				sizes,
				loading: loading,
				decoding: "async",
			};

			return Image.generateHTML(metadata, imageAttributes);
		} catch (e) {
			console.log(e);
			// return blank so no image appears if missing
			return ``;
		}
	}

	eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

	/* ------------------------- Calendar Link Shortcode ------------------------ */
	eleventyConfig.addShortcode(
		"calendarLink",
		function (title, description, dateStart, dateEnd, location, type = "google") {
			location = location || "";
			// TODO make this switch for online vs in person
			const event = {
				title: title,
				description: description,
				start: dateStart,
				end: dateEnd,
				//location: `Hyatt Regency San Francisco Airport, 1333 Old Bayshore Hwy, ${location}, Burlingame, CA 94010`,
				location: `https://twitch.tv/bigbadcon`,
			};

			if (type === "google") return google(event);
			if (type === "outlook") return outlook(event);
			if (type === "office365") return office365(event);
			if (type === "ics") return ics(event);
			if (type === "yahoo") return yahoo(event);
			return false;
		}
	);

	/* -------------------------------------------------------------------------- */
	/*                                 Global Data                                */
	/* -------------------------------------------------------------------------- */

	eleventyConfig.addGlobalData("siteBuildDate", () => {
		let now = new Date();
		return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long" }).format(now);
	});

	/* -------------------------------------------------------------------------- */
	/*                                 Build Stuff                                */
	/* -------------------------------------------------------------------------- */

	// Pass through 3rd party libraries
	eleventyConfig.addPassthroughCopy({
		"node_modules/lite-youtube-embed/src/lite-yt-embed.js": "js/lite-youtube-embed.js",
		"node_modules/lite-youtube-embed/src/lite-yt-embed.css": "css/lite-youtube-embed.css",
	});

	// Pass "static" things straight through from "src" to "dist"
	eleventyConfig.addPassthroughCopy("./src/static/");
	eleventyConfig.addPassthroughCopy("./src/images/");
	eleventyConfig.addPassthroughCopy("./src/_redirects");
	eleventyConfig.addPassthroughCopy("src/admin/assets");
	// eleventyConfig.addPassthroughCopy({"./src/assets/svgs" : "/static/svgs"});

	// Event images is a kludge until we can get it working with event manager
	eleventyConfig.addPassthroughCopy("./event-images/");
	// TODO: fix this as it is going in a loop for dev
	// eleventyConfig.addPassthroughCopy("./event-images-cache/");

	// Watch for changes in tailwind css
	eleventyConfig.addWatchTarget("./src/tailwind/tailwind.css");
	eleventyConfig.addWatchTarget("./src/_scripts/scripts.js");
	eleventyConfig.addWatchTarget("./event-images");

	// Clarify which folder is for input and which folder is for output
	return {
		dir: {
			input: "src",
			output: "dist",
		},
	};
};
