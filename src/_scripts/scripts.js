/* global */
import * as lilRed from "./lil-red.esm.js";
import axios from "axios";
import utf8 from "utf8";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);
import "array-flat-polyfill";
import Alpine from "alpinejs";
import persist from "@alpinejs/persist";
import validate from "@colinaut/alpinejs-plugin-simple-validate";
import "@colinaut/theme-multi-switch";
Alpine.plugin(persist);
Alpine.plugin(validate);
window.Alpine = Alpine;

window.lilRed = lilRed;

const lilRedApiUrl = "https://admin.bigbadcon.com:8091/api";

lilRed.init({
	lilRedApiUrl: lilRedApiUrl,
	verbose: true,
});
/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function isFullArray(arr) {
	return Array.isArray(arr) && arr.length;
}

function compareArrays(arr1, arr2) {
	return Array.isArray(arr1) && Array.isArray(arr2) && arr1.filter((val) => arr2.indexOf(val) !== -1);
}

function compareValues(a, b) {
	// return -1/0/1 based on what you "know" a and b
	// are here. Numbers, text, some custom case-insensitive
	// and natural number ordering, etc. That's up to you.
	// A typical "do whatever JS would do" is:

	return a < b ? -1 : a > b ? 1 : 0;
}
/* ------------ Transform metadata from events to a keyed object ------------ */
function metadataArrayToObject(arr) {
	const object = arr.reduce(function (result, item) {
		result[item.metaKey] = item.metaValue;
		return result;
	}, {});
	return object;
}

const decodeText = (text) => {
	try {
		return utf8.decode(text);
	} catch (error) {
		return text;
	}
};

/* --------------------------- Event Duration ------------------------------ */
// eslint-disable-next-line no-unused-vars
const getDurationInHours = (dateStart, dateEnd) => {
	dateStart = new Date(dateStart);
	dateEnd = new Date(dateEnd);
	return (Math.abs(dateEnd - dateStart) / 1000 / 3600) % 24;
};

/* -------------------------------------------------------------------------- */
/*                             API Fetch Functions                            */
/* -------------------------------------------------------------------------- */

// TODO: refactor all this to simpler global functions

// const apiBaseUrl = "https://admin.bigbadcon.com:8091/api";
// Dev API using Caddy server reverse proxy
// const apiBaseUrl = '/apidev'

// Global Fetch Function for API
// async function fetchData(url, options, authToken) {
// 	authToken = authToken || JSON.parse(localStorage.getItem("_x_authToken"));
// 	options = {
// 		method: "GET",
// 		headers: {
// 			"Content-Type": "application/json;charset=utf-8",
// 		},
// 		...options,
// 	};

// 	if (authToken) options.headers.Authorization = authToken;

// 	if (options.body) options.body = JSON.stringify(options.body);

// 	console.log("fetchData", url, options);

// 	try {
// 		let response = await fetch(apiBaseUrl + url, options);
// 		// eslint-disable-next-line no-console
// 		console.log(`RESPONSE:fetch for ${url}`, response);
// 		if (response.status !== 200) throw `fetch fail status: ${response.status}`;
// 		let result = await response.json();
// 		// eslint-disable-next-line no-console
// 		console.log(`RESULT:fetch for ${url}`, result);
// 		return result;
// 	} catch (err) {
// 		// eslint-disable-next-line no-console
// 		console.error(`ERROR:fetch for ${url}`, err);
// 		return false;
// 	}
// }

/* -------------------------------------------------------------------------- */
/*                                Alpine Stuff                                */
/* -------------------------------------------------------------------------- */

document.addEventListener("alpine:init", () => {
	/* -------------------------------------------------------------------------- */
	/*                                Alpine Global                               */
	/* -------------------------------------------------------------------------- */

	// Main data for logged in users

	Alpine.data("global", function () {
		return {
			init() {
				// check for lilRedAuthToken and _x_authToken; if _x_authToken set but not other than set LilRedAuthToken
				const lilRedAuthToken = localStorage.getItem("lilRedAuthToken");
				const lilRedLastLogin = localStorage.getItem("lilRedLastLogin");
				if (this.authToken && !lilRedAuthToken) {
					localStorage.setItem("lilRedAuthToken", this.authToken);
				}
				if (this.lastLogin && !lilRedLastLogin) {
					localStorage.setItem("lilRedLastLogin", this.lastLogin);
				}

				// logout if it's been more than 10 days
				if (!dayjs(this.lastLogin).isValid() || dayjs(this.lastLogin).diff(dayjs(), "hour") < -240) {
					this.logout("It has been more than 10 days since your last login so you are being logged out");
				}
				// check for error in url search params and dispatch toast if exists
				const url = new URL(window.location.href);
				const error = url.searchParams.get("error");
				if (error) {
					this.$dispatch("toast", `ERROR: ${error}`);
				}
			},
			modal: null, // this is a state machine basically with named string values for each panel and null for none
			lastLogin: this.$persist(null),
			authToken: this.$persist(false),
			user: this.$persist(false),
			availableSlots: this.$persist(null),
			bookedEvents: this.$persist([]),
			favEvents: this.$persist([]),
			isRegistered: this.$persist(null),
			volunteerEventSpaces: this.$persist([]),
			bboDiscordInvite: null,
			get isAuth() {
				// TODO: make this work with lilRed
				return typeof this.authToken === "string";
			},
			async submitLogin(username, password, form) {
				const status = await lilRed.status(20, 5000, 1.05);
				if (!status) return false;
				this.modal = "Loading";
				const token = await lilRed.login(username, password);
				if (token) {
					form.reset();
					// TODO rip out authToken and lastLogin once all API calls have converted to lilRed
					this.authToken = token;
					this.lastLogin = dayjs();
					await this.getUserData();
					await this.getAvailableSlots();
					await this.getBookedEvents();
					this.modal = "My Account";
					await this.getFavEvents();
					// trigger storage event for Run an Event Form
					window.dispatchEvent(
						new StorageEvent("storage", {
							key: "_x_authToken",
						})
					);
					// location.reload();
				} else {
					// eslint-disable-next-line no-console
					console.log("Login no token");
				}
			},
			logout(msg = "You have been logged out") {
				lilRed.logout();
				this.authToken = null;
				this.user = null;
				this.favEvents = [];
				this.availableSlots = null;
				this.bookedEvents = null;
				this.isRegistered = null;
				this.volunteerEventSpaces = [];
				this.bboDiscordInvite = null;
				this.$dispatch("toast", msg);
			},
			async getUserData() {
				let user = await lilRed.me();

				const userMetadata = metadataArrayToObject(user.metadata);
				const userRoles = [...userMetadata.wp_tuiny5_capabilities.matchAll(/"([a-z-]+)/g)].map(
					(match) => match[1]
				);
				user = {
					...user,
					metadata: userMetadata,
					roles: userRoles,
					displayName: decodeText(user.displayName) || user.displayName,
				};
				this.user = user;
				window.dispatchEvent(
					new StorageEvent("storage", {
						key: "_x_user",
					})
				);
				return user;
			},
			get badgeRoles() {
				return (
					this.user &&
					compareArrays(this.user.roles, [
						"gm",
						"paidattendee",
						"volunteer",
						"comp",
						"staff",
						"vendor",
						"admin",
					])
				);
			},
			get hasBadge() {
				return this.user && Array.isArray(this.badgeRoles) && this.badgeRoles.length > 0;
			},
			isRole(role) {
				return this.user && Array.isArray(this.user.roles) && this.user.roles.includes(role);
			},
			get isVolunteer() {
				return this.isRole("volunteer");
			},
			get isAdmin() {
				return this.isRole("administrator");
			},
			get isTeen() {
				return this.isRole("teen");
			},
			get isVendor() {
				return this.isRole("vendor");
			},
			get isSmallPressVendor() {
				return this.isRole("small-press-vendor");
			},
			get isOfficeHours() {
				return this.isRole("officehours");
			},
			get isPaid() {
				return this.isRole("paidattendee");
			},
			async checkRegistration(id, userNicename) {
				// Used for Big Bad Online
				id = id || this.user?.id;
				userNicename = userNicename || this.user?.userNicename;
				if (id) {
					userNicename = encodeURIComponent(userNicename);
					const url = `/.netlify/functions/check-registration/${id}/${userNicename}`;
					try {
						const response = await fetch(url);
						// eslint-disable-next-line no-console
						console.log(`RESPONSE:fetch for ${url}`, response);
						if (response.status !== 200) throw `checkRegistration fetch fail status: ${response.status}`;
						let data = await response.json();
						// eslint-disable-next-line no-console
						console.log(`RESULT:fetch for ${url}`, data);
						this.bboDiscordInvite = data.bboDiscordInvite;
						this.isRegistered = data.isRegistered;
						return data;
					} catch (err) {
						// eslint-disable-next-line no-console
						console.error(`ERROR: fetch for ${url}`, err);
						return false;
					}
				}
			},
			async getAvailableSlots() {
				const slots = await lilRed.bookings.slots();
				if (typeof slots === "number") this.availableSlots = slots;
				return slots;
			},
			async getBookedEvents() {
				// 1. Get ID array of my events
				let myEvents;
				try {
					myEvents = await lilRed.bookings.get();
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error(`ERROR: fetch for '/events/me/'`, err);
					return false;
				}
				// 2. Get event data from local JSON
				let eventData = {};
				try {
					const response = await fetch("/events.json");
					eventData = await response.json();
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error(`ERROR: fetch for '/events.json'`, err);
				}
				//create array from eventData.json and remove all undefined cancelled events and sort
				myEvents = myEvents
					.map((id) => eventData[id])
					.filter((event) => event)
					.sort((a, b) => {
						return dayjs(a.date) - dayjs(b.date);
					});
				// only show published events that are in the future (minus 1 month ago)
				this.bookedEvents = myEvents;
				// eslint-disable-next-line no-console
				console.log("🚀 ~ file: scripts.js ~ line 279 ~ getBookedEvents ~ myEvents", myEvents);
				return myEvents;
			},
			async bookEvent(id) {
				// Check network and data service before submitting event
				const status = await lilRed.status(20, 5000, 1.05);
				if (!status) return false;
				// book event
				const data = await lilRed.bookings.add(id);
				if (!data) {
					this.$dispatch("toast", "ERROR: booking change failed. Data service might be down.");
					return false;
				}
				// update availableSlots
				this.getAvailableSlots();
				this.$store.events.getSpace(id);
				this.getBookedEvents();
				return data;
			},
			async cancelBooking(id) {
				// Check network and data service before submitting event
				const status = await lilRed.status(20, 5000, 1.05);
				if (!status) return false;
				let data = await lilRed.bookings.delete(id);
				if (!data) {
					this.$dispatch("toast", "ERROR: booking change failed. Data service might be down.");
					return false;
				}
				// update availableSlots
				this.getAvailableSlots();
				this.$store.events.getSpace(id);
				this.getBookedEvents();
				return data;
			},
			async getFavEvents() {
				let data = await lilRed.favorites.get();
				// TODO: simplify this once the API is simplified
				this.favEvents =
					data &&
					data.map((item) => {
						if (typeof item === "number" || typeof item === "string") {
							return item;
						} else if (typeof item === "object" && item.eventId) {
							return item.eventId;
						}
					});
				return this.favEvents;
			},
			async toggleFav(id) {
				id = Number(id);
				// Check network and data service before favoriting
				const status = await lilRed.status();
				if (!status) return false;

				let data;
				if (this.isFav(id)) {
					this.favEvents = this.favEvents.filter((fav) => fav !== id);
					data = await lilRed.favorites.delete(id);
				} else {
					this.favEvents = [...this.favEvents, id];
					data = await lilRed.favorites.add(id);
				}
				if (!data) {
					this.$dispatch("toast", "ERROR: saving fav failed. data service might be offline.");
				}
			},
			isFav(id) {
				return isFullArray(this.favEvents) && this.favEvents.some((item) => item === id);
			},
			isBooked(id) {
				return isFullArray(this.bookedEvents) && this.bookedEvents.some((item) => item.id === id);
			},
			doesEventOverlap(date, dur) {
				function doesDateOverlap(start1, dur1, start2, dur2) {
					start1 = dayjs(start1);
					start2 = dayjs(start2);
					const end1 = start1.add(dur1, "h");
					const end2 = start2.add(dur2, "h");
					return end2 > start1 && start2 < end1;
					// 2-4;4-6 true && false
					// 2-5;4-6 true && true
					// 2-4;1-2 false && true
					// 2-4;2-4 true && true
				}

				return (
					this.bookedEvents &&
					this.bookedEvents.some((item) => doesDateOverlap(item.date, item.dur, date, dur))
				);
			},
			formatEventDate(date, tz = "America/Los_Angeles") {
				return dayjs(date).tz(tz).format("MMM D");
			},
			formatEventDateWithYear(date, tz = "America/Los_Angeles") {
				return dayjs(date).tz(tz).format("MMM D, YYYY");
			},
			formatEventTime(date, tz = "America/Los_Angeles") {
				return dayjs(date).tz(tz).format("h:mma");
			},
		};
	});

	/* -------------------------------------------------------------------------- */
	/*                             Alpine Events Store                            */
	/* -------------------------------------------------------------------------- */

	Alpine.store("events", {
		init() {
			// eslint-disable-next-line no-console
			console.log("events init");
			let spacesLS = JSON.parse(localStorage.getItem("spaces")) || {};
			this.spaces = spacesLS;
		},
		spaces: {},
		async getAllSpaces() {
			const spaces = await lilRed.events.public.spaces();
			if (spaces) {
				this.spaces = spaces;
				localStorage.setItem("spaces", JSON.stringify(this.spaces));
			}
		},
		async getSpace(id) {
			const space = await lilRed.events.public.space(id);
			if (typeof space === "number") {
				this.spaces = { ...this.spaces, [id]: space };
				localStorage.setItem("spaces", JSON.stringify(this.spaces));
			}
		},
	});

	/* TODO: convert above to custom elements
	 * 1. element for loading all spaces and storing in localStorage.
	 * 2. element to display event space using localStorage
	 *    a. with option to trigger getSpace() method to retrieve from API the event space and update if changed. This is useful for the event page.
	 *    b. getSpace() needs to be a public async method. This is useful for when booking is triggered.
	 */

	/* -------------------------------------------------------------------------- */
	/*                              Alpine Event Info                             */
	/* -------------------------------------------------------------------------- */

	/* ----------- eventInfo Used for Event Table Rows and Event Pages ---------- */

	/**
	 * Alpine Event Info x-data object
	 * TODO: need to review this to make sure the JSDoc is correct.
	 * * The lilRed.s promises are the unknowns. I need to improve the TypeScript in that for all the Promise returns as a bunch are just any.
	 *
	 * @typedef {Object} EventInfo
	 * @property {number} id - the id of the event; filled in via nunjucks
	 * @property {number | null} maxSpaces - the maximum number of spaces; also filled in via nunjucks; null means "Any"
	 * @property {Object[]} bookings - array of the bookings.
	 * @property {Object[]} gm - array of the game masters.
	 * @property {string} event_image - the image url of the event
	 * @property {(userId: number) => boolean} isGm - check if the user is a game master
	 * @property {(userId: number) => boolean} isOwner - check if the user is the owner
	 * @property {string} gmString - getter for combined string of the game masters
	 * @property {(id: number) => Promise<void>} getEventInfo - get the event info
	 * @property {(e: Event) => Promise<boolean>} uploadImage - get the spaces
	 * @property {(e: Event) => void} showPreview - show the preview of the image that has been added
	 * @property {() => string | false} getEventGUID - check Event GUID on page load; only if guid is in the URLSearchParams
	 * @property {(eventId: number) => Promise<string>} getAddtlGMCode - get event guid code and return it as a url with guid as a search param
	 * @property {(eventId: number, gmGuid: string) => Promise<string | null>} addAsGm - get event guid code and return it as a url with guid as a search param
	 */

	Alpine.data(
		"eventInfo",
		/**
		 * Returns the event info x-data function for the event table rows and event pages
		 * @return {EventInfo}
		 */
		function () {
			// See init on page
			return {
				id: 0,
				maxSpaces: null,
				bookings: [],
				gm: [],
				event_image: "",
				isGm(userId) {
					if (!userId) return false;
					return this.gm.some((gm) => gm.user.id === userId);
				},
				isOwner(userId) {
					if (!userId) return false;
					return this.owner === userId;
				},
				get gmString() {
					if (this.gm.length === 0) return "";
					return this.gm.map((gm) => gm.user.displayName).join(", ");
				},
				async getEventInfo(id) {
					id = id || this.id;
					let eventsLS = JSON.parse(localStorage.getItem("events")) || {};

					if (eventsLS[id]) {
						this.bookings = eventsLS[id].bookings;
						this.gm = eventsLS[id].gm;
						this.owner = eventsLS[id].owner;
						this.event_image = eventsLS[id].event_image;
					}

					try {
						// TODO: replace this with simpler API call when Jerry builds it; Also move it to events store.
						/* ------------------------ Get data from events/find ----------------------- */
						const data = await lilRed.events.find(id);
						// convert metadata to object
						const metadata = metadataArrayToObject(data.metadata);
						// filter out canceled bookings and fix name issues with odd characters
						const bookings = data.bookings
							.filter((booking) => booking.bookingStatus === 1)
							.map((booking) => {
								return {
									...booking,
									user: {
										...booking.user,
										displayName: decodeText(booking.user.displayName),
									},
								};
							});

						/* ------------------------ Update all data variables ----------------------- */
						// get only active bookings that are gms/speakers (bookingComment is null if not labelled)
						this.gm = bookings.filter((booking) => booking.bookingComment) || [];
						this.owner = data.eventOwner.id || "";
						// get only active bookings that are not gms/speakers (bookingComment is null if not labelled)
						this.bookings =
							bookings
								.filter((booking) => !booking.bookingComment)
								.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName)) || [];
						// get event_image
						this.event_image = metadata.event_image;

						/* -------------------------- Update Local Storage -------------------------- */
						eventsLS[id] = {
							bookings: this.bookings,
							gm: this.gm,
							owner: this.owner,
							event_image: this.event_image,
						};
						localStorage.setItem("events", JSON.stringify(eventsLS));
					} catch (e) {
						// eslint-disable-next-line no-console
						console.log(e);
					}
				},
				async getImage() {
					console.log("getImage", this.id);
					const result = await lilRed.events.public.image(this.id);
					if (result) {
						this.event_image = result;
					}
					return result;
				},
				async uploadImage(e) {
					// Check network and data service before submitting event
					const status = await lilRed.status();
					if (!status) return false;

					const eventId = e.target.eventId.value;
					const formData = new FormData(e.target);

					let data = await lilRed.events.uploadImage(formData);

					if (data) {
						// if data update event data with new image
						let eventsLS = JSON.parse(localStorage.getItem("events")) || {};
						if (eventsLS[eventId]) {
							this.event_image = data.fileName;
						}
						eventsLS[eventId] = {
							bookings: this.bookings,
							gm: this.gm,
							event_image: this.event_image,
						};
						localStorage.setItem("events", JSON.stringify(eventsLS));
						location.reload();
					}

					return data;
				},
				showPreview(e) {
					if (e.target.files.length > 0) {
						const src = URL.createObjectURL(e.target.files[0]);
						const preview = document.getElementById("image-preview");
						const button = document.getElementById("upload-button");
						preview.src = src;
						preview.style.display = "block";
						button.style.display = "inline-block";
					}
				},
				getEventGUID() {
					// Function to check Event GUID on page load
					if (location.search) {
						const params = new URLSearchParams(location.search);
						let gmGuid = params.get("guid");
						if (gmGuid) {
							return gmGuid;
						}
					}
					return false;
				},
				async getAddtlGMCode(eventId) {
					const result = await lilRed.events.getAddtlGMCode(eventId);
					return result && `${window.location.href}?guid=${result}`;
				},
				async addAsGm(eventId, gmGuid, userId) {
					const url = "/.netlify/functions/addGMLog";
					// TODO: only allow for people with badges
					if (!gmGuid) {
						this.$dispatch("toast", `ERROR: GM code required.`);
						await fetch(url, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ log: "ERROR No GM Code", eventId, gmGuid, userId }),
						});
						return;
					}
					if (this.gm.length >= 6) {
						this.$dispatch(
							"toast",
							`ERROR: There are already the max ${this.gm.length} GMs on this event.`
						);
						await fetch(url, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ log: "ERROR Max GMs", eventId, gmGuid, userId }),
						});
						return;
					}
					try {
						const result = await lilRed.bookings.addAsAddtlGM(eventId, gmGuid);
						if (result) {
							await fetch(url, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ log: "Added as GM", result, eventId, gmGuid, userId }),
							});
							location.reload();
						}
						return result;
					} catch (error) {
						this.$dispatch("toast", `ERROR: add GM failed: ${error.message}`);
						await fetch("/.netlify/functions/addGMlog", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ log: "ERROR", error, eventId, gmGuid }),
						});
						return;
					}
				},
				async log(data) {
					console.log("log", data);
					await fetch("/.netlify/functions/addGMLog", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ log: "Testing", data }),
					});
				},
			};
		}
	);

	Alpine.data("createAccount", () =>
		/**
		 * Returns the create account x-data function for the creating an account form.
		 * @return {CreateAccount}
		 */
		({
			agree: false,
			userNicename: "",
			userNicenameExists: undefined,
			userEmail: "",
			userPass: "",
			firstName: "",
			lastName: "",
			howToDisplay: "firstlast",
			nickname: "",
			displayName: "",
			twitter: "", // not set up yet in API
			userLogin: "",
			// TODO: change to fetch
			async checkUsername(userName) {
				try {
					const res = await axios.get(`/.netlify/functions/check-user/${userName}`);
					console.log(res);
					if (res) {
						this.userNicenameExists = res.data.isUser;
					}
				} catch (err) {
					// eslint-disable-next-line no-console
					console.log(err);
				}
			},
		})
	);

	// Change Password
	Alpine.data("resetPasswordForm", () => ({
		userEmail: "",
		resetPasswordFormState: "empty",
		async resetPassword() {
			this.resetPasswordFormState = "working";
			if (this.userEmail) {
				const paramSafeEmail = this.userEmail.replace(/\+/gi, "%2B"); // replace + symbols for URLSearchParams
				// TODO: change to fetch
				const res = await axios.get(`/.netlify/functions/forgot-password/?email=${paramSafeEmail}`);
				if (res && res.data === "forgot password email sent") {
					this.resetPasswordFormState = "succeeded";
					// eslint-disable-next-line no-console
					console.log("email address found. Sent reset email");
				} else {
					this.resetPasswordFormState = "failed";
				}
				this.userEmail = "";
			}
		},
	}));

	/* -------------------------------------------------------------------------- */
	/*                                 Status Page                                */
	/* -------------------------------------------------------------------------- */
	Alpine.data("statusTester", () => ({
		status: "unchecked",
		online: undefined,
		response: undefined,
		error: undefined,
		async fetchApi(api) {
			try {
				this.response = await fetch(`${lilRedApiUrl}${api}`);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error);
				this.error = error;
			}
		},
	}));

	/* -------------------------------------------------------------------------- */
	/*                                 Contact Form                                */
	/* -------------------------------------------------------------------------- */
	Alpine.data("contactForm", () => ({
		messageSubject: "",
	}));
});

/* -------------------------------------------------------------------------- */
/*                           Polyfills for Safari 11                          */
/* -------------------------------------------------------------------------- */

/* ----------------------------- queueMicrotask ----------------------------- */
if (typeof self.queueMicrotask !== "function") {
	self.queueMicrotask = function (callback) {
		Promise.resolve()
			.then(callback)
			.catch((e) =>
				setTimeout(() => {
					throw e;
				})
			); // report exceptions
	};
}
/* ------------------------- Polyfill for globalThis ------------------------ */
(function () {
	if (typeof globalThis === "object") return;
	Object.prototype.__defineGetter__("__magic__", function () {
		return this;
	});
	/* global __magic__ */
	__magic__.globalThis = __magic__; // lolwat
	delete Object.prototype.__magic__;
})();

/* -------------------------------- flatMap() ------------------------------- */
// See https://unpkg.com/array-flat-polyfill in head

Alpine.start();
