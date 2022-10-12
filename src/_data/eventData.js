const Cache = require("@11ty/eleventy-cache-assets");
// const rootCas = require('ssl-root-cas').create();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
const environment = process.env.CONTEXT;
const fs = require("fs-extra");
const utf8 = require("utf8");
const windows1252 = require("windows-1252");

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/* ------------------------- Convert odd characters ------------------------- */
// utf8 interpreted as windows-1252
// We are using an old 1.x.x version of windows-1252 here as newer versions are ESM only and they don't work with UTF8 module.
// Honestly this is a kludge and should be fixed server side in Phase 2
const decodeText = (text) => {
	try {
		text = windows1252.encode(text, {
			mode: "html",
		});
		return utf8.decode(text);
	} catch (error) {
		return text;
	}
};

/* ------------------- Sort by start time& alphabetically ------------------- */
function eventSort(events) {
	return events.sort(
		(a, b) =>
			a.eventStartDateTime - b.eventStartDateTime ||
			a.eventName.localeCompare(b.eventName)
	);
}

/* ---------------------------- Main url for API ---------------------------- */

const url = "https://admin.bigbadcon.com:8091/api/events/all/public";
// const url = "https://admin.bigbadcon.com/apidev/events/all/public"

/* -------- Convert metadata array to object to make it easier to use ------- */
function metadataArrayToObject(arr) {
	const object = arr.reduce(function (result, item) {
		result[item.metaKey] = item.metaValue;
		return result;
	}, {});
	return object;
}

/* --------------------------- Event Duration ------------------------------ */
// If duration is more than 0 it returns a string of the hrs

const getDurationInHours = (dateStart, dateEnd) => {
	dateStart = new Date(dateStart);
	dateEnd = new Date(dateEnd);
	return (Math.abs(dateEnd - dateStart) / 1000 / 3600) % 24;
};

/* -------------------------------------------------------------------------- */
/*                              Metadata Tag Ids                              */
/* -------------------------------------------------------------------------- */

const metadataTags = {
	panelTopic: [
		{
			id: 160,
			name: "GMing Advice",
			slug: "gming-advice",
		},
		{
			id: 159,
			name: "Literature",
			slug: "literature",
		},
		{
			id: 161,
			name: "Player Advice",
			slug: "player-advice",
		},
		{
			id: 163,
			name: "Safety Tools",
			slug: "safety-tools",
		},
		{
			id: 162,
			name: "Social Contracts",
			slug: "social-contracts",
		},
		{
			id: 158,
			name: "Social Justice",
			slug: "social-justice",
		},
	],
	gameFocus: [
		{
			id: 55,
			name: "Adventure",
			slug: "adventure",
		},
		{
			id: 62,
			name: "Combat",
			slug: "combat",
		},
		{
			id: 59,
			name: "Drama",
			slug: "drama",
		},
		{
			id: 56,
			name: "Exploration",
			slug: "exploration",
		},
		{
			id: 61,
			name: "Hijinx",
			slug: "hijinx",
		},
		{
			id: 191,
			name: "Improv",
			slug: "improv",
		},
		{
			id: 58,
			name: "Intrigue",
			slug: "intrigue",
		},
		{
			id: 57,
			name: "Investigation",
			slug: "investigation",
		},
		{
			id: 181,
			name: "LGBTQ themes",
			slug: "lgbtq-themes",
		},
		{
			id: 167,
			name: "Mystery",
			slug: "mystery",
		},
		{
			id: 60,
			name: "Romance",
			slug: "romance",
		},
	],
	playerContributions: [
		{
			id: 66,
			name: "Collaborative",
			slug: "collaborative",
		},
		{
			id: 188,
			name: "Freeform",
			slug: "freeform",
		},
		{
			id: 67,
			name: "GM-less",
			slug: "gm-less",
		},
		{
			id: 64,
			name: "Play to find out",
			slug: "play-to-find-out",
		},
		{
			id: 65,
			name: "Player antagonism",
			slug: "player-antagonism",
		},
		{
			id: 68,
			name: "Rotating authority",
			slug: "rotating-authority",
		},
		{
			id: 63,
			name: "Strong storyline",
			slug: "strong-storyline",
		},
	],
	gameGenre: [
		{
			id: 171,
			name: "Aliens",
			slug: "aliens",
		},
		{
			id: 73,
			name: "Alternate History",
			slug: "alternate-history",
		},
		{
			id: 76,
			name: "Apocalyptic",
			slug: "apocalyptic",
		},
		{
			id: 156,
			name: "Cyberpunk",
			slug: "cyberpunk",
		},
		{
			id: 77,
			name: "Espionage",
			slug: "espionage",
		},
		{
			id: 71,
			name: "Fantasy",
			slug: "fantasy",
		},
		{
			id: 69,
			name: "Horror",
			slug: "horror",
		},
		{
			id: 78,
			name: "Military",
			slug: "military",
		},
		{
			id: 72,
			name: "Modern",
			slug: "modern",
		},
		{
			id: 167,
			name: "Mystery",
			slug: "mystery",
		},
		{
			id: 75,
			name: "Noir",
			slug: "noir",
		},
		{
			id: 74,
			name: "Pulp",
			slug: "pulp",
		},
		{
			id: 70,
			name: "Sci-Fi",
			slug: "sci-fi",
		},
		{
			id: 120,
			name: "Super Powers",
			slug: "super-powers",
		},
	],
	gameMood: [
		{
			id: 80,
			name: "Comical",
			slug: "comical",
		},
		{
			id: 175,
			name: "Cute",
			slug: "cute",
		},
		{
			id: 82,
			name: "Dark",
			slug: "dark",
		},
		{
			id: 83,
			name: "Emotional",
			slug: "emotional",
		},
		{
			id: 81,
			name: "Light",
			slug: "light",
		},
		{
			id: 133,
			name: "Melancholy",
			slug: "melancholy",
		},
		{
			id: 79,
			name: "Serious",
			slug: "serious",
		},
		{
			id: 187,
			name: "Silly",
			slug: "silly",
		},
		{
			id: 84,
			name: "Suspenseful",
			slug: "suspenseful",
		},
	],
	contentAdvisoryOptions: [
		{
			id: 91,
			name: "Gore",
			slug: "gore",
		},
		{
			id: 90,
			name: "Graphic Violence",
			slug: "graphic-violence",
		},
		{
			id: 88,
			name: "Provocative",
			slug: "provocative",
		},
		{
			id: 89,
			name: "Sex and Sexuality",
			slug: "sex-and-sexuality",
		},
	],
};

/* ----------------- Build metadata object with ids as keys ----------------- */

let metadataTagsObj = {};

Object.keys(metadataTags).forEach((type) => {
	const tempObj = metadataTags[type].reduce((acc, tag) => {
		const { id } = tag;
		return { ...acc, [id]: tag };
	}, {});
	metadataTagsObj = { ...metadataTagsObj, ...tempObj };
});

/* -------------------------------------------------------------------------- */
/*                                 Main Export                                */
/* -------------------------------------------------------------------------- */

module.exports = async () => {
	try {
		let data = await Cache(url, {
			duration: "1d",
			type: "json",
		});

		/* -------------- Filter out unpublished events by eventStatus -------------- */
		// TODO: figure out a better way to handle this for main vs drafts
		// 0: draft or pending, 1: published, -1 or null: trashed
		// TODO: issue found is that eventStatus = null when it is moved to trash back to drafts?
		if (environment === "production")
			data = data.filter((event) => event.eventStatus === 1);
		// Only show dates in the future (minus 1 month)
		data = data.filter((event) =>
			dayjs(event.eventStartDate).isAfter(dayjs().subtract(1, "month"))
		);

		/* ---------------- fix data if missing slug and decode text ---------------- */
		data = data.map((event) => {
			// if it is missing the eventSlug then use the eventId
			if (!event.eventSlug) event.eventSlug = event.eventId.toString();

			/* ---------- Convert metadata array to a more usable keyed object ---------- */
			let metadata = metadataArrayToObject(event.metadata);
			// decode GM field text to proper format
			// TODO: refactor so that both this and the past events works the same? Right now we convert this to an object here but with past events we use a filter. Might be nice if we did it on the server API side though.
			metadata = {
				...metadata,
				GM: metadata.GM && decodeText(metadata.GM),
				System: metadata.System && decodeText(metadata.System),
			};

			/* -------------------- Create date string with timezone -------------------- */
			const tz = "America/Los_Angeles";
			// TODO: need to sort out Proper Timezone and Daylight Savings Time. This is locking it to PDT; PST is -08:00
			const eventStartDateTime = dayjs(
				event.eventStartDate + "T" + event.eventStartTime + "-07:00"
			)
				.tz(tz)
				.toISOString();
			const eventEndDateTime = dayjs(
				event.eventEndDate + "T" + event.eventEndTime + "-07:00"
			)
				.tz(tz)
				.toISOString();
			// convert to simple array sorted alphabetically
			const categories = event.categories
				.map((val) => val.name)
				.sort((a, b) => a.localeCompare(b));

			/* ------------------ Build tags list from eventMetadataIds ----------------- */
			const tags = event.eventMetadataIds.reduce((acc, val) => {
				if (
					Object.keys(metadataTagsObj).includes(
						val.termTaxonomyId.toString()
					)
				) {
					const tag = metadataTagsObj[val.termTaxonomyId].name;
					return [...acc, tag];
				}
				return [...acc];
			}, []);

			const hasContentAdvisoryTags =
				tags.length > 0 &&
				tags.every((val) =>
					[
						"Gore",
						"Graphic Violence",
						"Provocative",
						"Sex and Sexuality",
					].includes(val)
				);

			/* ----------------------- Return modified event data ----------------------- */
			return {
				...event,
				eventName: decodeText(event.eventName), // change to proper format
				postContent: decodeText(event.postContent), // change to proper format
				metadata: metadata, // replace with keyed object
				eventStartDateTime: eventStartDateTime, // native javascript date object
				eventEndDateTime: eventEndDateTime, // native javascript date object
				eventDuration: getDurationInHours(
					eventStartDateTime,
					eventEndDateTime
				), // duration in hours and minutes
				eventSlug: event.eventSlug.toLowerCase(), // force lowercase
				categories: categories, // convert to simple array
				isVolunteer: categories.includes("Volunteer Shift"),
				tags: tags, // Kludge until we get it from the api
				contentAdvisory:
					hasContentAdvisoryTags ||
					typeof metadata.trigger_warnings === "string",
			};
		});

		/* -------------------------------------------------------------------------- */
		/*                Create simplified event data for events.json                */
		/* -------------------------------------------------------------------------- */
		const simpleData = data.map((event) => {
			return {
				id: event.eventId,
				name: event.eventName,
				slug: event.eventSlug,
				date: event.eventStartDateTime,
				dur: event.eventDuration,
				status: event.eventStatus,
				room: isNaN(event.metadata.room)
					? event.metadata.room
					: `ROOM ${event.metadata.room}`,
				table: event.metadata.table,
				isV: event.isVolunteer ? 1 : 0,
			};
		});

		const simpleDataObject = simpleData.reduce((acc, event) => {
			const { id } = event;
			return { ...acc, [id]: event };
		}, {});

		// This is used for My Events so it's not hitting the API
		fs.outputFile(
			"./dist/events.json",
			JSON.stringify(simpleDataObject),
			(err) => {
				if (err) {
					// eslint-disable-next-line no-console
					console.log(err);
				} else {
					// eslint-disable-next-line no-console
					console.log("events.json written successfully");
				}
			}
		);

		/* ------------------ Separate Events from Volunteer shifts ----------------- */
		const events = data.filter(
			(event) =>
				!event.categories.some(
					(category) => category === "Volunteer Shift"
				)
		);
		// console.log(events);
		const volunteer = data.filter((event) =>
			event.categories.some((category) => category === "Volunteer Shift")
		);

		/* ------------------- Return object with events separated ------------------ */
		return {
			events: eventSort(events),
			volunteer: eventSort(volunteer),
			all: eventSort(data),
		};
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log("error", error);
		return {
			events: [],
			volunteer: [],
		};
	}
};
