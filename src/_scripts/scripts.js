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
import "./lil-red-theme-switch";
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

const apiBaseUrl = "https://admin.bigbadcon.com:8091/api";
// Dev API using Caddy server reverse proxy
// const apiBaseUrl = '/apidev'

// Global Fetch Function for API
async function fetchData(url, options, authToken) {
	authToken = authToken || JSON.parse(localStorage.getItem("_x_authToken"));
	options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		...options,
	};

	if (authToken) options.headers.Authorization = authToken;

	if (options.body) options.body = JSON.stringify(options.body);

	try {
		let response = await fetch(apiBaseUrl + url, options);
		// eslint-disable-next-line no-console
		console.log(`RESPONSE:fetch for ${url}`, response);
		if (response.status !== 200) throw `fetch fail status: ${response.status}`;
		let result = await response.json();
		// eslint-disable-next-line no-console
		console.log(`RESULT:fetch for ${url}`, result);
		return result;
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(`ERROR:fetch for ${url}`, err);
		return false;
	}
}

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
				return user;
			},
			get badgeRoles() {
				return (
					this.user && compareArrays(this.user.roles, ["gm", "paidattendee", "volunteer", "comp", "staff"])
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
			async changePassword(userId, password) {
				const data = await fetchData("/users/setMyPassword", {
					method: "POST",
					body: { userId: userId, password: password },
				});
				return data;
			},
			async hello() {
				const response = await fetch(apiBaseUrl + "/", {
					method: "GET",
				});
				return response.status === 200;
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

	/* -------------------------------------------------------------------------- */
	/*                             Alpine Event Table                             */
	/* -------------------------------------------------------------------------- */

	Alpine.data("eventsTable", function () {
		return {
			init() {
				this.searchUrlParams();
				this.testFilters();

				// sort table on login
				const page = location.pathname
					.split("/")
					.filter((c) => c.length)
					.pop();
				if (this.sort[page] && this.sort[page].col !== undefined) {
					const th = this.$root.querySelectorAll("table th button");
					this.sortTable(th[this.sort[page].col], this.sort[page].ascending);
				}
			},
			filter: this.$persist({
				favsOnly: false,
				openOnly: false,
				category: "All",
				day: "All",
				overlap: false,
			}),
			get isFilterDefault() {
				return (
					this.filter.favsOnly === false &&
					this.filter.openOnly === false &&
					this.filter.category.toLowerCase() === "all" &&
					this.filter.day.toLowerCase() === "all" &&
					this.filter.overlap === false
				);
			},
			testFilters() {
				// test on init to make sure all the filters are valid
				this.filter.favsOnly = typeof this.filter.favsOnly === "boolean" ? this.filter.favsOnly : false;
				this.filter.openOnly = typeof this.filter.openOnly === "boolean" ? this.filter.openOnly : false;
				this.filter.overlap = typeof this.filter.overlap === "boolean" ? this.filter.overlap : false;
				this.setCategory(this.filter.category);
				this.setDay(this.filter.day);
			},
			resetFilters() {
				this.filter.favsOnly = false;
				this.filter.openOnly = false;
				this.filter.overlap = false;
				this.filter.category = "All";
				this.filter.day = "All";
			},
			resetUserFilters() {
				this.filter.favsOnly = false;
				this.filter.openOnly = false;
				this.filter.overlap = false;
			},
			sort: this.$persist({}),
			sortBy: this.$persist(1),
			sortAscending: this.$persist(true),
			allCategories: [
				"All",
				"RPG",
				"LARP",
				"Board/Card Game",
				"Playtest",
				"Panel",
				"Workshop",
				"GoD",
				"All Ages",
				"Early Signup",
				"Vending",
			],
			onlineCategories: ["All", "Panel", "Practicum", "Seminar", "Topical"],
			setCategory(cat) {
				// TODO: make category list more dynamic
				this.filter.category =
					this.filter.category &&
					cat &&
					this.allCategories.some((val) => val.toLowerCase() === cat.toLowerCase())
						? cat
						: "all";
			},
			filterCategory(categories) {
				return (
					this.filter.category.toLowerCase() === "all" ||
					categories.some((cat) => cat.toLowerCase() === this.filter.category.toLowerCase())
				);
			},
			allDays: ["All", "Mar 31", "Apr 1"], // TODO: make this dynamic
			setDay(day) {
				// TODO: make day range more dynamic
				this.filter.day =
					this.filter.day && day && this.allDays.some((val) => val.toLowerCase() === day.toLowerCase())
						? day
						: "all";
			},
			filterDay(date) {
				return this.filter.day.toLowerCase() === "all" || this.filter.day.toLowerCase() === date.toLowerCase();
			},
			sortable: {
				["@click"](e) {
					this.sortTable(e);
				},
				[":class"]() {
					const page = location.pathname
						.split("/")
						.filter((c) => c.length)
						.pop();
					if (this.sort[page] && this.sort[page].ascending) {
						return "ascending";
					} else {
						return "descending";
					}
				},
			},
			isSort(el) {
				const page = location.pathname
					.split("/")
					.filter((c) => c.length)
					.pop();
				const table = el.closest("table");
				const ths = Array.from(table.querySelectorAll(`th`));
				const col = ths.findIndex((th) => th === el.closest("th"));
				const sortCol = this.sort[page] && this.sort[page].col;
				const ascending = this.sort[page] && this.sort[page].ascending;
				return { col: col === sortCol, ascending: ascending };
			},
			sortTable(e, ascending) {
				// Allow for either the event or the element to be used
				const el = e instanceof Element ? e : e.target;
				const page = location.pathname
					.split("/")
					.filter((c) => c.length)
					.pop();
				const table = el.closest("table");
				const parentTh = el.closest("th");
				const ths = Array.from(table.querySelectorAll(`th`));
				const col = ths.findIndex((th) => th === el.closest("th"));

				ths.forEach((th) => {
					if (th !== parentTh) {
						th.classList.remove("active");
					} else {
						th.classList.add("active");
					}
				});

				const tbody = table.querySelector("tbody");
				const rows = Array.from(tbody.querySelectorAll(`tr`));

				// If boolean than just use ascending var
				if (typeof ascending !== "boolean") {
					// If this is the same column than flip direction, otherwise sort ascending
					ascending =
						this.sort[page] && this.sort[page].col === col && typeof this.sort[page].ascending === "boolean"
							? !this.sort[page].ascending
							: true;
				}

				// Store values
				this.sort[page] = { col: col, ascending: ascending };

				let qs = `td:nth-child(${col + 1})`;

				rows.sort((r1, r2) => {
					// get each row's relevant column
					let t1 = r1.querySelector(qs);
					let t2 = r2.querySelector(qs);
					// if it has data-sort attribute than use that
					t1 = t1.dataset.sort || t1.textContent;
					t2 = t2.dataset.sort || t2.textContent;

					// check if this is a number and if so convert to number
					t1 = isNaN(Number(t1)) ? t1 : Number(t1);
					t2 = isNaN(Number(t2)) ? t2 : Number(t2);
					// If one is a number and the other is not then convert then non number to 0
					// this is mainly for the spaces column
					if (isNaN(t1) && !isNaN(t2)) t1 = 0;
					if (isNaN(t2) && !isNaN(t1)) t2 = 0;

					// and then effect sorting by comparing their content:
					if (ascending) {
						return compareValues(t1, t2);
					} else {
						return compareValues(t2, t1);
					}
				});

				// and then the magic part that makes the sorting appear on-page:
				rows.forEach((row) => tbody.appendChild(row));
			},
			searchUrlParams() {
				if (location.search) {
					const params = new URLSearchParams(location.search);
					let cat = params.get("cat");
					if (cat) {
						cat = cat.replace("-", " ").toLowerCase();
						this.setCategory(cat);
					}
				}
			},
		};
	});
	/* -------------------------------------------------------------------------- */
	/*                              Alpine Event Info                             */
	/* -------------------------------------------------------------------------- */

	/* ----------- eventInfo Used for Event Table Rows and Event Pages ---------- */

	Alpine.data("eventInfo", function () {
		// See init on page
		return {
			id: 0, // this is filled in in nunjucks
			categories: [], // this is filled in in nunjucks
			maxSpaces: null, // this is filled in nunjucks; it is either a number or null, which mean "Any"
			bookings: [],
			gm: [],
			event_image: "",
			async getEventInfo(id) {
				id = id || this.id;
				let eventsLS = JSON.parse(localStorage.getItem("events")) || {};

				if (eventsLS[id]) {
					this.bookings = eventsLS[id].bookings;
					this.gm = eventsLS[id].gm;
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
						event_image: this.event_image,
					};
					localStorage.setItem("events", JSON.stringify(eventsLS));
				} catch (e) {
					// eslint-disable-next-line no-console
					console.log(e);
				}
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
		};
	});

	Alpine.data("createAccount", () => ({
		agree: false,
		userNicename: "",
		userNicenameExists: false,
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
		async checkUsername() {
			try {
				const res = await axios.get(`/.netlify/functions/check-user/${this.userNicename}`);
				if (res && res.data === "user exists") {
					this.userNicenameExists = true;
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(err);
			}
		},
	}));

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
