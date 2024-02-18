import type { TinaField } from "tinacms";

const socials = [
	{
		type: "string",
		name: "twitter",
		label: "X (formerly known as twitter) handle without the @",
	},
	{
		type: "string",
		name: "mastodon",
		label: "mastodon handle (full handle: @name@server.place)",
	},
	{
		type: "string",
		name: "bluesky",
		label: "bluesky handle",
	},
	{
		type: "string",
		name: "twitch",
		label: "twitch handle",
	},
	{
		type: "string",
		name: "instagram",
		label: "instagram handle",
	},
	{
		type: "string",
		name: "facebook",
		label: "facebook handle (name or page name for facebook link. If you reach your page with facebook.com/catgame then your handle is catgame",
	},
	{
		type: "string",
		name: "website_name",
		label: "website name",
	},
	{
		type: "string",
		name: "website_url",
		label: "website url (full url with https://)",
	},
];
export function blogFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "title",
			required: true,
		},
		{
			type: "datetime",
			name: "date",
			label: "date",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "rich-text",
			name: "body",
			label: "Body of Document",
			description: "This is the markdown body",
			isBody: true,
		},
		{
			type: "string",
			name: "excerpt",
			label: "excerpt",
			ui: {
				component: "textarea",
			},
		},
		{
			type: "image",
			name: "coverImage",
			label: "cover image",
		},
		{
			type: "string",
			name: "coverImageAlt",
			label: "cover image alt text",
		},
		{
			type: "image",
			name: "ogImage",
			label: "open graph image",
		},
	] as TinaField[];
}
export function content_footerFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "string",
			name: "location",
			label: "location",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
	] as TinaField[];
}
export function eventsFields() {
	return [
		{
			type: "string",
			name: "layout",
			label: "layout",
		},
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "string",
			name: "description",
			label: "description",
		},
		{
			type: "image",
			name: "ogImage",
			label: "open graph image",
		},
		{
			type: "string",
			name: "navGroup",
			label: "navGroup",
			options: ["Attend", "Events", "Volunteer", "Community", "Blog"],
		},
		{
			type: "string",
			name: "navTitle",
			label: "navTitle",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "string",
			name: "icon",
			label: "icon",
			options: [
				"accessibility",
				"add",
				"art",
				"badge",
				"book",
				"booth",
				"bullhorn",
				"calendar-clock",
				"calendar-star",
				"close",
				"dice",
				"discord",
				"envelope",
				"faq",
				"games-on-demand",
				"gift",
				"health",
				"hotel",
				"image",
				"itch-io",
				"kickstarter",
				"library",
				"light-bulb",
				"list",
				"menu",
				"moon",
				"overlap",
				"parachute",
				"party",
				"paw",
				"pencil-square",
				"pig",
				"price-tags",
				"scholar",
				"scroll",
				"settings",
				"shield",
				"square-check",
				"square-full",
				"square-open",
				"star",
				"sun",
				"trophy",
				"twitch",
				"twitter",
				"website",
				"wolf",
				"youtube",
			],
		},
		{
			type: "boolean",
			name: "suggestEvent",
			label: "suggestEvent",
		},
		{
			type: "boolean",
			name: "runEvent",
			label: "runEvent",
		},
	] as TinaField[];
}
export function footerFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
	] as TinaField[];
}
export function home_page_big_cardsFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "image",
			name: "image",
			label: "image",
		},
		{
			type: "string",
			name: "alt",
			label: "image alt text",
		},
	] as TinaField[];
}
export function home_page_cardsFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "image",
			name: "image",
			label: "image",
		},
		{
			type: "string",
			name: "alt",
			label: "image alt text",
		},
	] as TinaField[];
}
export function pageFields() {
	return [
		{
			type: "string",
			name: "layout",
			label: "layout",
			options: [
				"layouts/donate.njk",
				"layouts/events.njk",
				"layouts/events-archive.njk",
				"layouts/home.njk",
				"layouts/page.njk",
				"layouts/page-wide.njk",
				"layouts/exhibitors.njk",
				"layouts/form-activate-gift-badge.njk",
				"layouts/form-apply-for-scholarship.njk",
				"layouts/form-buy-a-badge.njk",
				"layouts/form-change-password.njk",
				"layouts/form-claim-badge.njk",
				"layouts/form-contact-us.njk",
				"layouts/form-covid-support.njk",
				"layouts/form-create-account.njk",
				"layouts/form-exhibitor.njk",
				"layouts/form-register.njk",
				"layouts/form-run-games-on-demand.njk",
				"layouts/form-run-an-event.njk",
				"layouts/form-submit-a-panel.njk",
				"layouts/form-suggest-event.njk",
				"layouts/form-volunteer-signup.njk",
				"layouts/poc-scholars.njk",
				"layouts/register-thank-you.njk",
				"layouts/staff.njk",
				"layouts/stretch-goal-guests.njk",
				"layouts/volunteer-shifts.njk",
			],
		},
		{
			type: "string",
			name: "title",
			label: "title",
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			name: "eventType",
			label: "Event Type",
			description: "Site mode: Big Bad Online or the Big Bad Con in person event",
			type: "string",
			options: ["both", "in person", "online"],
		},
		{
			type: "string",
			name: "description",
			label: "description",
			ui: {
				component: "textarea",
			},
		},
		{
			type: "image",
			name: "ogImage",
			label: "open graph image",
		},
		{
			type: "string",
			name: "navGroup",
			label: "navGroup",
			options: ["Attend", "Events", "Volunteer", "Community", "Blog"],
		},
		{
			type: "string",
			name: "navTitle",
			label: "navTitle",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "string",
			name: "icon",
			label: "icon",
			options: [
				"accessibility",
				"add",
				"art",
				"badge",
				"book",
				"booth",
				"bullhorn",
				"calendar-clock",
				"calendar-star",
				"close",
				"dice",
				"discord",
				"envelope",
				"faq",
				"games-on-demand",
				"gift",
				"health",
				"hotel",
				"image",
				"itch-io",
				"kickstarter",
				"library",
				"light-bulb",
				"list",
				"menu",
				"moon",
				"overlap",
				"parachute",
				"party",
				"paw",
				"pencil-square",
				"pig",
				"price-tags",
				"scholar",
				"scroll",
				"settings",
				"shield",
				"square-check",
				"square-full",
				"square-open",
				"star",
				"sun",
				"trophy",
				"twitch",
				"twitter",
				"website",
				"wolf",
				"youtube",
			],
		},
		{
			type: "string",
			name: "permalink",
			label: "permalink",
			description: "Permalink for the page. If not set, the filename will be used.",
		},
	] as TinaField[];
}
export function poc_scholarsFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "Name",
			required: true,
		},
		{
			type: "string",
			name: "position",
			label: "Position Title",
		},
		{
			type: "string",
			name: "tags",
			label: "tags",
			list: true,
			options: ["poc-scholar", "poc-team-member", "poc-emeritus"],
			required: true,
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "string",
			name: "gender",
			label: "gender",
			required: true,
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "image",
			name: "image",
			label: "image",
		},
		...socials,
	] as TinaField[];
}
export function staffFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "Name",
			required: true,
		},
		{
			type: "string",
			name: "position",
			label: "Position Title",
		},
		{
			type: "string",
			name: "tags",
			label: "tags",
			list: true,
			options: ["staff", "staff-emeritus"],
			required: true,
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "string",
			name: "gender",
			label: "gender",
			required: true,
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "image",
			name: "image",
			label: "image",
		},
		...socials,
	] as TinaField[];
}
export function guestFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "Name",
			required: true,
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "string",
			name: "gender",
			label: "gender",
			required: true,
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "image",
			name: "image",
			label: "image",
		},
		...socials,
	] as TinaField[];
}
export function exhibitorFields() {
	return [
		{
			type: "string",
			name: "title",
			label: "Name",
			required: true,
		},
		{
			type: "boolean",
			name: "published",
			label: "published",
		},
		{
			type: "number",
			name: "order",
			label: "order",
		},
		{
			type: "image",
			name: "logo",
			label: "logo",
		},
		...socials,
	] as TinaField[];
}
export function globalFields() {
	return [
		{
			name: "onlineEventStartDate",
			label: "Online Event: Start Date",
			type: "datetime",
		},
		{
			name: "onlineEventEndDate",
			label: "Online Event: End Date",
			type: "datetime",
		},
		{
			name: "conEventStartDate",
			label: "Con Event: Start Date",
			type: "datetime",
		},
		{
			name: "conEventEndDate",
			label: "Con Event: End Date",
			type: "datetime",
		},
		{
			name: "conEventSignUpsOpen",
			label: "Con Event: Sign-ups Open",
			type: "datetime",
			ui: {
				timeFormat: "HH:mm",
			},
			description: "When game sign-ups are opened",
		},
		{
			name: "eventType",
			label: "Event Type",
			description: "Site mode: Big Bad Online or the Big Bad Con in person event",
			type: "string",
			options: ["in person", "online"],
		},
		{
			name: "showEventTimes",
			label: "Show Event Times",
			description: "Show date/times on events table on the events page",
			type: "boolean",
		},
	] as TinaField[];
}
