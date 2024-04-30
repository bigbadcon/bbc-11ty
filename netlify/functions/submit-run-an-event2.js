// @ts-check
// const axios = require("axios");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// BBC API
const bbcApiBaseUrl = "https://admin.bigbadcon.com:8091/api/";
// const bbcApiKey = `ApiKey ${process.env.BBC_API_KEY}`;

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Generates a dictionary of parameters for the Run an Event Form
 *
 * @param {string} body - The body string containing the parameters.
 * @return {import('../../types/bbc-api').RunAnEventForm}
 */

function getParams(body) {
	const urlParams = new URLSearchParams(body);
	const entries = urlParams.entries();
	const result = {};
	for (const [key, value] of entries) {
		// each 'entry' is a [key, value] tupple
		// Make sure properties that are checkboxes are turned into arrays or comma separated strings as needed
		if (key === "eventTags") {
			result[key] = result[key] || [];
			result[key].push(value);
		} else if (key === "safetyTools" || key === "schedulingPref" || key === "requestMediaEquipment") {
			result[key] = result[key] ? result[key] + ", " + value : value;
		} else {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Transforms object properties to strings if they are boolean, number, or an array.
 *
 * @param {Record<string, string | boolean | number | string[] | number[]>} obj - The object whose properties are to be transformed.
 * @return {Record<string, string>} The object with transformed properties.
 */
function transformObjectPropertiesToString(obj) {
	/** @type {Record<string, string>} */
	const newObj = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key) && !(typeof obj[key] === "object" && obj[key] !== null)) {
			newObj[key] = obj[key].toString();
		}
	}
	return newObj;
}

exports.handler = async function (event) {
	/* -------------------------------------------------------------------------- */
	/*                      Get params and transform for API                      */
	/* -------------------------------------------------------------------------- */

	console.log("Try submit to BBC Event");

	/**
	 * Get params and transform for API
	 * @type {import('../../types/bbc-api').RunAnEventForm}
	 */
	const params = getParams(event.body);
	console.log("params", params);

	const origin = event.headers.origin;
	const failurePage = `${origin}/${params.failurePage}`;
	const successPage = `${origin}/${params.successPage}`;

	const eventCategoryId = eventsMeta.find((meta) => meta.name === params.format)?.id;

	// If some eventName or eventDescription are missing, return error
	if (
		typeof params.authToken !== "string" ||
		!params.eventName ||
		!params.eventDescription ||
		!params.format ||
		!params.userId ||
		!params.userEmail ||
		!params.gm ||
		!params.gmAge ||
		!params.eventLength ||
		!params.playerAge ||
		!params.userDisplayName ||
		!eventCategoryId
	) {
		return {
			statusCode: 303,
			headers: {
				Location: failurePage + "?error=Missing+important+form+data",
			},
		};
	}

	// add safetyToolsOther to safetyTools array
	if (params.safetyTools && params.safetyToolsOther) {
		params.safetyTools = params.safetyTools + ", " + params.safetyToolsOther;
	}

	// create eventMetadataIds array
	const eventMetadataIds = [eventCategoryId];

	// Create eventTags array and add ids to eventMetadataIds array
	const eventTags = params.eventTags || [];
	eventTags.forEach((tag) => {
		const id = eventsMeta.find((meta) => meta.name === tag)?.id;
		if (id) eventMetadataIds.push(id);
	});

	let eventMetadataNamesString = [params.format, ...eventTags].join(", "); // eventMetadataNamesString

	// if playerAge === "13+" then add 193 to eventMetadataIds array
	if (params.playerAge === "13+") {
		eventMetadataIds.push(193);
		eventMetadataNamesString = eventMetadataNamesString + ", All Ages";
	}

	// if playtest = "Yes" then add 157 to eventMetadataIds array
	if (params.playtest === "Yes") {
		eventMetadataIds.push(157);
		eventMetadataNamesString = eventMetadataNamesString + ", Playtest";
	}

	/**
	 * Build createEvent payload
	 * type {{ additionalRequirements: string; characters: string; contentAdvisory: boolean; eventCategoryId: number; eventDescription: string; eventMetadataIds: number[]; eventMetadataNamesString: string; eventName: string; eventTags: string[]; format: string; gm: string; gmAge: string; length: string; minPlayers: string; otherInfo: string; playerAge: string; players: string; playtest: string; requestMediaEquipment: string; requestPrivateRoom: string; runNumberOfTimes: number; safetyTools: string; schedulingPref: string; system: string; tableType: string; triggerWarnings: string; userDisplayName: string}}
	 * @type {import('../../types/bbc-api').EventsCreatePayload}
	 */
	const createEventPayload = {
		accessabilityOptions: "", // not used anymore
		additionalRequirements: params.additionalRequirements || "",
		additionalGms: "", // not used anymore
		characters: params.characters || "",
		contentAdvisory: params.contentAdvisory === "Yes",
		eventCategoryId: eventCategoryId,
		eventName: params.eventName,
		eventDescription: params.eventDescription,
		eventFacilitators: "", // not used anymore
		eventMetadataIds: eventMetadataIds,
		eventMetadataNamesString: eventMetadataNamesString,
		eventTags: params.eventTags || [],
		format: params.format,
		gm: params.gm,
		gmAge: params.gmAge,
		length: params.eventLength,
		minPlayers: params.minPlayers || "1",
		otherInfo: params.phone || params.discord ? `Phone: ${params.phone} Discord: ${params.discord}` : "", // params.discord,
		playerAge: params.playerAge,
		players: params.players || "50",
		playtest: params.playtest || "",
		requestMediaEquipment: params.requestMediaEquipment || "",
		requestMediaRoom: params.format === "Podcast/Stream",
		requestPrivateRoom: params.requestPrivateRoom || "",
		runNumberOfTimes: Number(params.runNumberOfTimes || 1),
		safetyTools: params.safetyTools || "",
		schedulingPref: params.schedulingPref || "No Preference",
		system: params.system || "",
		tableType: params.tableType || "",
		triggerWarnings: params.triggerWarnings || "",
		userDisplayName: params.userDisplayName,
	};

	console.log("createEventPayload:", createEventPayload, JSON.stringify(createEventPayload));

	/* -------------------------------------------------------------------------- */
	/*                          1. Post to BBC API                                */
	/* -------------------------------------------------------------------------- */

	let eventId = "NA";

	try {
		const response = await fetch(bbcApiBaseUrl + "events/create", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: params.authToken,
			},
			body: JSON.stringify(createEventPayload),
		});
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		eventId = await response.text();
		console.log("🚀 ~ event submitted, eventID:", eventId);
	} catch (error) {
		console.log("Post to BBC API error", error);
		// TODO: handle error message as adding query doesn't work
		return {
			statusCode: 303,
			headers: {
				Location: failurePage + "?error=Failed+to+create+event",
			},
		};
	}

	// // Get the google sheet id based on the referrer

	// console.log("🚀 ~ exports.handler=function ~ googleSheetId", googleSheetId);

	/* -------------------------------------------------------------------------- */
	/*                        2. Submit data to google form                       */
	/* -------------------------------------------------------------------------- */

	console.log("Try submit to Google Sheet");

	// build payload object; transform all properties to strings
	let googleSheetPayload = transformObjectPropertiesToString(createEventPayload);
	console.log("🚀 ~ googleSheetPayload:", googleSheetPayload);
	// Add date and eventId
	googleSheetPayload = {
		dateAdded: new Date().toLocaleDateString(),
		eventId: eventId,
		...googleSheetPayload,
	};
	// delete unnecessary properties from googleSheetPayload
	delete googleSheetPayload.eventMetadataIds;
	delete googleSheetPayload.eventMetadataNamesString;
	delete googleSheetPayload.additionalGms;
	delete googleSheetPayload.eventFacilitators;
	delete googleSheetPayload.accessabilityOptions;
	delete googleSheetPayload.eventCategoryId;
	delete googleSheetPayload.requestMediaRoom;
	console.log("🚀 ~ googleSheetPayload:", googleSheetPayload);
	try {
		const GOOGLE_SHEET_ID = event.headers.referer.includes("submit-a-panel")
			? process.env.GOOGLE_SHEET_BBO_PANEL
			: process.env.GOOGLE_SHEET_RUN_AN_EVENT;

		const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
		const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

		if (!GOOGLE_SHEET_ID || !GOOGLE_PRIVATE_KEY || !GOOGLE_SERVICE_ACCOUNT_EMAIL) {
			throw new Error("Missing GOOGLE_SHEET_ID or GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_EMAIL");
		}
		// Initialize the sheet - doc ID is the long id in the sheets URL
		const serviceAccountAuth = new JWT({
			email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
			key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});

		console.log(GOOGLE_SHEET_ID, serviceAccountAuth);

		const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);

		// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

		await doc.loadInfo(); // loads document properties and worksheets

		// Check if sheet exists; if not create it with the header row based on googleSheetPayload properties
		const year = new Date().getFullYear().toString();
		let sheet = doc.sheetsByTitle[year];
		if (!sheet) {
			sheet = await doc.addSheet({ title: year, headerValues: Object.keys(googleSheetPayload) });
		}

		/* ---------------------- Take submit event and add row --------------------- */

		const addedRow = await sheet.addRow(googleSheetPayload);
		console.log("addedRow", addedRow);
	} catch (e) {
		console.log("Google Sheet failed", e);
	}

	const location = successPage + `#${eventId}`;
	console.log("🚀 ~ location:", location);
	return {
		statusCode: 303,
		headers: {
			Location: location,
		},
	};
};

const eventsMeta = [
	{
		id: 193,
		name: "All Ages",
		slug: "all-ages",
		type: "event-categories",
	},
	{
		id: 11,
		name: "Board/Card Game",
		slug: "board-game",
		type: "event-categories",
	},
	{
		id: 209,
		name: "GoD",
		slug: "god",
		type: "event-categories",
	},
	{
		id: 10,
		name: "LARP",
		slug: "larp",
		type: "event-categories",
	},
	{
		id: 154,
		name: "Panel",
		slug: "panel",
		type: "event-categories",
	},
	{
		id: 157,
		name: "Playtest",
		slug: "playtest",
		type: "event-categories",
	},
	{
		id: 9,
		name: "RPG",
		slug: "rpg",
		type: "event-categories",
	},
	{
		id: 201,
		name: "Vending",
		slug: "vending",
		type: "event-categories",
	},
	{
		id: 200,
		name: "Volunteer Shift",
		slug: "volunteer-shift",
		type: "event-categories",
	},
	{
		id: 13,
		name: "Workshop",
		slug: "workshop",
		type: "event-categories",
	},
	{
		id: 212,
		name: "Podcast/Stream",
		slug: "podcast-stream",
		type: "event-categories",
	},
	{
		id: 211,
		name: "Special Event",
		slug: "special-event",
		type: "event-categories",
	},
	{
		id: 56,
		name: "Adventure",
		slug: "adventure",
		type: "event-tags",
	},
	{
		id: 171,
		name: "Aliens",
		slug: "aliens",
		type: "event-tags",
	},
	{
		id: 74,
		name: "Alternate History",
		slug: "alternate-history",
		type: "event-tags",
	},
	{
		id: 77,
		name: "Apocalyptic",
		slug: "apocalyptic",
		type: "event-tags",
	},
	{
		id: 67,
		name: "Collaborative",
		slug: "collaborative",
		type: "event-tags",
	},

	{
		id: 63,
		name: "Combat",
		slug: "combat",
		type: "event-tags",
	},
	{
		id: 81,
		name: "Comical",
		slug: "comical",
		type: "event-tags",
	},
	{
		id: 175,
		name: "Cute",
		slug: "cute",
		type: "event-tags",
	},
	{
		id: 156,
		name: "Cyberpunk",
		slug: "cyberpunk",
		type: "event-tags",
	},
	{
		id: 83,
		name: "Dark",
		slug: "dark",
		type: "event-tags",
	},
	{
		id: 60,
		name: "Drama",
		slug: "drama",
		type: "event-tags",
	},
	{
		id: 84,
		name: "Emotional",
		slug: "emotional",
		type: "event-tags",
	},
	{
		id: 78,
		name: "Espionage",
		slug: "espionage",
		type: "event-tags",
	},
	{
		id: 57,
		name: "Exploration",
		slug: "exploration",
		type: "event-tags",
	},
	{
		id: 72,
		name: "Fantasy",
		slug: "fantasy",
		type: "event-tags",
	},
	{
		id: 188,
		name: "Freeform",
		slug: "freeform",
		type: "event-tags",
	},
	{
		id: 68,
		name: "GM-less",
		slug: "gm-less",
		type: "event-tags",
	},
	{
		id: 160,
		name: "GMing Advice",
		slug: "gming-advice",
		type: "event-tags",
	},
	{
		id: 92,
		name: "Gore",
		slug: "gore",
		type: "event-tags",
	},
	{
		id: 91,
		name: "Graphic Violence",
		slug: "graphic-violence",
		type: "event-tags",
	},
	{
		id: 62,
		name: "Hijinx",
		slug: "hijinx",
		type: "event-tags",
	},
	{
		id: 70,
		name: "Horror",
		slug: "horror",
		type: "event-tags",
	},
	{
		id: 191,
		name: "Improv",
		slug: "improv",
		type: "event-tags",
	},
	{
		id: 59,
		name: "Intrigue",
		slug: "intrigue",
		type: "event-tags",
	},
	{
		id: 58,
		name: "Investigation",
		slug: "investigation",
		type: "event-tags",
	},
	{
		id: 181,
		name: "LGBTQ themes",
		slug: "lgbtq-themes",
		type: "event-tags",
	},
	{
		id: 82,
		name: "Light",
		slug: "light",
		type: "event-tags",
	},
	{
		id: 159,
		name: "Literature",
		slug: "literature",
		type: "event-tags",
	},
	{
		id: 134,
		name: "Melancholy",
		slug: "melancholy",
		type: "event-tags",
	},
	{
		id: 79,
		name: "Military",
		slug: "military",
		type: "event-tags",
	},
	{
		id: 73,
		name: "Modern",
		slug: "modern",
		type: "event-tags",
	},
	{
		id: 102,
		name: "Mutant",
		slug: "mutant",
		type: "event-tags",
	},
	{
		id: 167,
		name: "Mystery",
		slug: "mystery",
		type: "event-tags",
	},
	{
		id: 76,
		name: "Noir",
		slug: "noir",
		type: "event-tags",
	},
	{
		id: 65,
		name: "Play to find out",
		slug: "play-to-find-out",
		type: "event-tags",
	},
	{
		id: 161,
		name: "Player Advice",
		slug: "player-advice",
		type: "event-tags",
	},
	{
		id: 66,
		name: "Player antagonism",
		slug: "player-antagonism",
		type: "event-tags",
	},
	{
		id: 89,
		name: "Provocative",
		slug: "provocative",
		type: "event-tags",
	},
	{
		id: 75,
		name: "Pulp",
		slug: "pulp",
		type: "event-tags",
	},
	{
		id: 61,
		name: "Romance",
		slug: "romance",
		type: "event-tags",
	},
	{
		id: 69,
		name: "Rotating authority",
		slug: "rotating-authority",
		type: "event-tags",
	},
	{
		id: 163,
		name: "Safety Tools",
		slug: "safety-tools",
		type: "event-tags",
	},
	{
		id: 71,
		name: "Sci-Fi",
		slug: "sci-fi",
		type: "event-tags",
	},
	{
		id: 80,
		name: "Serious",
		slug: "serious",
		type: "event-tags",
	},
	{
		id: 90,
		name: "Sex and Sexuality",
		slug: "sex-and-sexuality",
		type: "event-tags",
	},
	{
		id: 187,
		name: "Silly",
		slug: "silly",
		type: "event-tags",
	},
	{
		id: 162,
		name: "Social Contracts",
		slug: "social-contracts",
		type: "event-tags",
	},
	{
		id: 158,
		name: "Social Justice",
		slug: "social-justice",
		type: "event-tags",
	},
	{
		id: 121,
		name: "Super Powers",
		slug: "super-powers",
		type: "event-tags",
	},
	{
		id: 64,
		name: "Strong storyline",
		slug: "strong-storyline",
		type: "event-tags",
	},
	{
		id: 120,
		name: "Super Powers",
		slug: "super-powers",
		type: "event-tags",
	},
	{
		id: 85,
		name: "Suspenseful",
		slug: "suspenseful",
		type: "event-tags",
	},
];
