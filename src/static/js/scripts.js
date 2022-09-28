/* global Alpine dayjs lilRed utf8 windows1252 axios */

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function isFullArray(arr) {
	return Array.isArray(arr) && arr.length;
}

function compareArrays(arr1, arr2) {
	return (
		Array.isArray(arr1) &&
		Array.isArray(arr2) &&
		arr1.filter((val) => arr2.indexOf(val) !== -1)
	);
}

function compareValues(a, b) {
	// return -1/0/1 based on what you "know" a and b
	// are here. Numbers, text, some custom case-insensitive
	// and natural number ordering, etc. That's up to you.
	// A typical "do whatever JS would do" is:

	return a < b ? -1 : a > b ? 1 : 0;
}

/* ------------------------- Convert odd characters ------------------------- */
const decodeText = (text) => {
	return (
		text &&
		utf8.decode(
			windows1252.encode(text, {
				mode: "html",
			})
		)
	);
};

/* -------------------------------------------------------------------------- */
/*                             dayjs event format                             */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line no-unused-vars
function formatEventDate(date, tz = "America/Los_Angeles") {
	return dayjs(date).tz(tz).format("MMM D");
}
// eslint-disable-next-line no-unused-vars
function formatEventDateWithYear(date, tz = "America/Los_Angeles") {
	return dayjs(date).tz(tz).format("MMM D, YYYY");
}
// eslint-disable-next-line no-unused-vars
function formatEventTime(date, tz = "America/Los_Angeles") {
	return dayjs(date).tz(tz).format("h:mma");
}

/* -------------------------------------------------------------------------- */
/*                            Misc Functions                                  */
/* -------------------------------------------------------------------------- */

/* ------------ Transform metadata from events to a keyed object ------------ */
function metadataArrayToObject(arr) {
	const object = arr.reduce(function (result, item) {
		result[item.metaKey] = item.metaValue;
		return result;
	}, {});
	return object;
}

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
		if (response.status !== 200)
			throw `fetch fail status: ${response.status}`;
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
				lilRed.init({
					lilRedApiUrl: "https://admin.bigbadcon.com:8091/api",
				});
				// logout if it's been more than 10 days
				if (
					!dayjs(this.lastLogin).isValid() ||
					dayjs(this.lastLogin).diff(dayjs(), "hour") < -240
				) {
					this.logout(
						"It has been more than 10 days since your last login so you are being logged out"
					);
				}
				if (this.isAuth) {
					this.getAvailableSlots();
				}
			},
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
				return typeof this.authToken === "string";
			},
			async submitLogin(username, password) {
				// Check network and data service before submitting event
				const network = await this.checkNetworkStatus();
				if (!network) return false;
				// eslint-disable-next-line no-console
				console.log("submitLogin", username);
				let res = await fetch(apiBaseUrl + "/login", {
					headers: {
						"Content-Type": "application/json;charset=utf-8",
					},
					method: "POST",
					body: JSON.stringify({
						username: username,
						password: password,
					}),
				});
				// eslint-disable-next-line no-console
				console.log("response", res, res.headers.get("authorization"));
				if (res.status === 200 && res.headers.get("authorization")) {
					const token = res.headers.get("authorization");
					this.authToken = token;
					this.lastLogin = dayjs();
					if (token) {
						// Need to pass token for first couple since there is a delay with the $persist code storing it
						await this.getUserData(token);
						await this.getAvailableSlots();
						await this.getBookedEvents();
						await this.getFavEvents();
						// this.checkRegistration()  this was for Big Bad Online
					}
					return token;
				} else {
					// TODO: better error message to say if password is wrong
					this.$dispatch("toast", "ERROR: login failed");
					return false;
				}
			},
			logout(msg = "You have been logged out") {
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
			async getUserData(token) {
				token = token || this.authToken;
				let user = await fetchData("/users/me", {}, token);
				this.checkNetworkStatus();

				const userMetadata = metadataArrayToObject(user.metadata);
				const userRoles = [
					...userMetadata.wp_tuiny5_capabilities.matchAll(
						/"([a-z-]+)/g
					),
				].map((match) => match[1]);
				user = {
					...user,
					metadata: userMetadata,
					roles: userRoles,
					displayName:
						decodeText(user.displayName) || user.displayName,
				};
				this.user = user;
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
					])
				);
			},
			get hasBadge() {
				return (
					this.user &&
					Array.isArray(this.badgeRoles) &&
					this.badgeRoles.length > 0
				);
			},
			isRole(role) {
				return (
					this.user &&
					Array.isArray(this.user.roles) &&
					this.user.roles.includes(role)
				);
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
			async checkRegistration() {
				// Used for Big Bad Online
				const url = `/.netlify/functions/check-registration/${this.user.id}/${this.user.userNicename}`;
				try {
					const response = await fetch(url);
					// eslint-disable-next-line no-console
					console.log(`RESPONSE:fetch for ${url}`, response);
					if (response.status !== 200)
						throw `checkRegistration fetch fail status: ${response.status}`;
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
			},
			async getEvents() {
				const data = await fetchData("/events/all/public");
				// eslint-disable-next-line no-console
				console.log("getEvents", data);
			},
			async getAvailableSlots() {
				const slots = await fetchData("/bookings/myAvailableSlots");
				if (typeof slots === "number") this.availableSlots = slots;
				return slots;
			},
			async getBookedEvents() {
				// 1. Get ID array of my events
				let myEvents;
				try {
					myEvents = await fetchData("/events/me/", {});
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error(`ERROR: fetch for '/events/me/'`, err);
					return false;
				}
				// Logout if this fails as it indicates we are offline. This is necessary because we had issues with  people submitting forms and it didn't work.
				this.checkNetworkStatus();
				// 2. Get event data from local JSON
				let eventData = {};
				try {
					const response = await fetch("/events.json");
					eventData = await response.json();
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error(`ERROR: fetch for '/events.json'`, err);
				}
				//create array from eventData.json and remove all undefined cancelled events
				myEvents = myEvents
					.map((id) => eventData[id])
					.filter((event) => event)
					.sort((a, b) => {
						return (
							dayjs(a.eventStartDateTime) -
							dayjs(b.eventStartDateTime)
						);
					});
				// only show published events that are in the future (minus 1 month ago)
				this.bookedEvents = myEvents;
				// eslint-disable-next-line no-console
				console.log(
					"🚀 ~ file: scripts.js ~ line 279 ~ getBookedEvents ~ myEvents",
					myEvents
				);
				return myEvents;
			},
			async bookEvent(id) {
				// Check network and data service before submitting event
				const network = await this.checkNetworkStatus();
				if (!network) return false;
				// book event
				const data = await fetchData("/bookings/bookMeIntoGame", {
					method: "POST",
					body: { gameId: id },
				});
				if (!data) {
					this.$dispatch(
						"toast",
						"ERROR: booking change failed. Data service might be down."
					);
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
				const network = await this.checkNetworkStatus();
				if (!network) return false;
				let data = await fetchData("/bookings/removeMeFromGame", {
					method: "DELETE",
					body: { gameId: id, guid: id },
				});
				if (!data) {
					this.$dispatch(
						"toast",
						"ERROR: booking change failed. Data service might be down."
					);
					return false;
				}
				// update availableSlots
				this.getAvailableSlots();
				this.$store.events.getSpace(id);
				this.getBookedEvents();
				return data;
			},
			async getFavEvents() {
				let data = await fetchData("/events/me/favorites");
				// TODO: simplify this once the API is simplified
				this.favEvents =
					data &&
					data.map((item) => {
						if (
							typeof item === "number" ||
							typeof item === "string"
						) {
							item;
						} else if (typeof item === "object" && item.eventId) {
							item.eventId;
						}
					});
				return this.favEvents;
			},
			async toggleFav(id) {
				id = Number(id);
				// Check network and data service before submitting event
				const network = await this.checkNetworkStatus();
				if (!network) return false;

				let data;
				if (this.isFav(id)) {
					this.favEvents = this.favEvents.filter((fav) => fav !== id);
					data = await fetchData("/events/me/favorite/delete", {
						method: "DELETE",
						body: { eventId: id },
					});
				} else {
					this.favEvents = [...this.favEvents, id];
					data = await fetchData("/events/me/favorite/create", {
						method: "POST",
						body: { eventId: id },
					});
				}
				if (!data) {
					this.$dispatch(
						"toast",
						"ERROR: saving fav failed. data service might be offline."
					);
				}
			},
			isFav(id) {
				return (
					isFullArray(this.favEvents) &&
					this.favEvents.some((item) => item === id)
				);
			},
			isBooked(id) {
				return (
					isFullArray(this.bookedEvents) &&
					this.bookedEvents.some((item) => item.id === id)
				);
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
					this.bookedEvents.some((item) =>
						doesDateOverlap(item.date, item.dur, date, dur)
					)
				);
			},
			async changePassword(userId, password) {
				const data = await fetchData("/users/setMyPassword", {
					method: "POST",
					body: { userId: userId, password: password },
				});
				return data;
			},
			async checkNetworkStatus() {
				if (!navigator.onLine) {
					this.$dispatch(
						"toast",
						"ERROR: You are currently offline! Booking and forms will not work."
					);
					return false;
				} else {
					const littleRedStatus = await this.hello();
					if (!littleRedStatus) {
						this.$dispatch("lilRedStatus");
						return false;
					}
					return true;
				}
				// TODO: add timer that checked for data service status
			},
			async hello() {
				const response = await fetch(apiBaseUrl + "/", {
					method: "GET",
				});
				return response.status === 200;
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
			const spaces = await fetchData("/events/spaces/public");
			if (spaces) {
				this.spaces = spaces;
				localStorage.setItem("spaces", JSON.stringify(this.spaces));
			}
		},
		async getSpace(id) {
			const space = await fetchData(`/events/${id}/spaces/public`);
			if (space) {
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
					this.sortTable(
						th[this.sort[page].col],
						this.sort[page].ascending
					);
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
				this.filter.favsOnly =
					typeof this.filter.favsOnly === "boolean"
						? this.filter.favsOnly
						: false;
				this.filter.openOnly =
					typeof this.filter.openOnly === "boolean"
						? this.filter.openOnly
						: false;
				this.filter.overlap =
					typeof this.filter.overlap === "boolean"
						? this.filter.overlap
						: false;
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
			setCategory(cat) {
				// TODO: make category list more dynamic
				this.filter.category =
					this.filter.category &&
					cat &&
					this.allCategories.some(
						(val) => val.toLowerCase() === cat.toLowerCase()
					)
						? cat
						: "all";
			},
			filterCategory(categories) {
				return (
					this.filter.category.toLowerCase() === "all" ||
					categories.some(
						(cat) =>
							cat.toLowerCase() ===
							this.filter.category.toLowerCase()
					)
				);
			},
			allDays: ["All", "Oct 27", "Oct 28", "Oct 29", "Oct 30"],
			setDay(day) {
				// TODO: make day range more dynamic
				this.filter.day =
					this.filter.day &&
					day &&
					this.allDays.some(
						(val) => val.toLowerCase() === day.toLowerCase()
					)
						? day
						: "all";
			},
			filterDay(date) {
				return (
					this.filter.day.toLowerCase() === "all" ||
					this.filter.day.toLowerCase() === date.toLowerCase()
				);
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
						this.sort[page] &&
						this.sort[page].col === col &&
						typeof this.sort[page].ascending === "boolean"
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
					cat = cat.replace("-", " ").toLowerCase();

					this.setCategory(cat);
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
					const data = await fetchData("/events/find", {
						method: "POST",
						body: { id: id },
					});
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
									displayName: decodeText(
										booking.user.displayName
									),
								},
							};
						});

					/* ------------------------ Update all data variables ----------------------- */
					// get only active bookings that are gms/speakers (bookingComment is null if not labelled)
					this.gm =
						bookings.filter((booking) => booking.bookingComment) ||
						[];
					// get only active bookings that are not gms/speakers (bookingComment is null if not labelled)
					this.bookings =
						bookings
							.filter((booking) => !booking.bookingComment)
							.sort((a, b) =>
								a.user.displayName.localeCompare(
									b.user.displayName
								)
							) || [];
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
				if (!navigator.onLine) {
					this.$dispatch(
						"toast",
						"You are currently offline! Booking and forms will not work."
					);
					return false;
				} else {
					const littleRed = await fetch(apiBaseUrl + "/", {
						method: "GET",
					});
					if (littleRed.status !== 200) {
						this.$dispatch(
							"toast",
							"The data service is currently offline! Please wait and try again."
						);
						return false;
					}
				}

				if (!this.isAdmin) return false;

				const eventId = e.target.eventId.value;
				const formData = new FormData(e.target);

				async function customFetch(url, authToken) {
					const options = {
						method: "POST",
						headers: {
							Authorization: authToken,
						},
						body: formData,
					};

					try {
						let response = await fetch(apiBaseUrl + url, options);
						// eslint-disable-next-line no-console
						console.log(`RESPONSE:fetch for ${url}`, response);
						if (response.status !== 200)
							throw `fetch fail status: ${response.status}`;
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

				let data = await customFetch("/events/image", this.authToken);

				if (data) {
					// if data update event data with new image
					let eventsLS =
						JSON.parse(localStorage.getItem("events")) || {};
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
				const res = await axios.get(
					`/.netlify/functions/check-user/${this.userNicename}`
				);
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
				const res = await axios.get(
					`/.netlify/functions/forgot-password/?email=${paramSafeEmail}`
				);
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

	// Change Password
	Alpine.data("changePasswordForm", () => ({
		uuid: null,
		userEmail: "",
		userPass: "",
		passwordChangedState: "empty",
		async changePassword() {
			this.passwordChangedState = "working";
			if (this.uuid) {
				const paramSafeEmail = this.userEmail.replace(/\+/gi, "%2B"); // replace + symbols for URLSearchParams
				// TODO: change to fetch
				const res = await axios.get(
					`/.netlify/functions/change-password/?uuid=${this.uuid}&email=${paramSafeEmail}&password=${this.userPass}`
				);
				if (res && res.data === "password changed") {
					// eslint-disable-next-line no-console
					console.log("password change succeeded");
					this.passwordChangedState = "succeeded";
				} else {
					// eslint-disable-next-line no-console
					console.log("password change failed");
					this.passwordChangedState = "failed";
				}
				this.userEmail = "";
				this.userPass = "";
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
