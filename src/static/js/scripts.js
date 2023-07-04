/* -------------------------------------------------------------------------- */
/*                                ESLint Stuff                                */
/* -------------------------------------------------------------------------- */

// These all are included in the html head
/* global Alpine lilRed dayjs */

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function isFullArray(arr) {
	return Array.isArray(arr) && arr.length;
}

/* -------------------------------------------------------------------------- */
/*                            Misc Functions                                  */
/* -------------------------------------------------------------------------- */

/* --------------------------- dayjs event format --------------------------- */

// eslint-disable-next-line no-unused-vars -- this is used for the timezone picker
// TODO: replace this with the new improved one on BBC
// eslint-disable-next-line no-unused-vars
function formatEventDate(date, tz = "America/Los_Angeles") {
	return (
		"<span style='white-space: nowrap;'>" +
		dayjs(date).tz(tz).format("MMM D, YYYY") +
		"</span> <span>" +
		dayjs(date).tz(tz).format("h:mm a") +
		"</span>"
	);
}

/* ------------ Transform metadata from events to a keyed object ------------ */
function metadataArrayToObject(arr) {
	if (!Array.isArray(arr)) return false;
	const object = arr.reduce(function (result, item) {
		result[item.metaKey] = item.metaValue;
		return result;
	}, {});
	return object;
}

/* --------------------------- Event Duration ------------------------------ */

const duration = (dateStart, dateEnd) => {
	// calculate hours
	let diffInMilliSeconds = Math.abs(dateEnd - dateStart) / 1000;
	const hours = Math.floor(diffInMilliSeconds / 3600) % 24;

	diffInMilliSeconds -= hours * 3600;
	// calculate minutes
	const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
	diffInMilliSeconds -= minutes * 60;
	return hours.toString();
};

/* -------------------------------------------------------------------------- */
/*                             API Fetch Functions                            */
/* -------------------------------------------------------------------------- */

// TODO: refactor all this to simpler global functions

const apiBaseUrl = "https://api-prod.goplaynw.org";
// Dev API using Caddy server reverse proxy
// const apiBaseUrl = '/apidev'

// Global Fetch Function for API
async function fetchData(url, options, authToken) {
	authToken = authToken || JSON.parse(localStorage.getItem("_x_authToken"));
	options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
			Authorization: authToken,
		},
		...options,
	};
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
				lilRed.init({ lilRedApiUrl: apiBaseUrl });
				// logout if it's been more than 10 days
				if (
					!dayjs(this.lastLogin).isValid() ||
					dayjs(this.lastLogin).diff(dayjs(), "hour") < -240
				)
					this.logout();
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
			get notAuth() {
				return (
					typeof this.authToken === "object" ||
					typeof this.authToken === "undefined"
				);
			},
			async submitLogin(username, password) {
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
						this.availableSlots = await fetchData(
							"/bookings/myAvailableSlots",
							{},
							token
						);
						await this.getBookedEvents();
						await this.getFavEvents();
						// this.checkRegistration()  this was for Big Bad Online
					}
					return token;
				} else return false;
			},
			logout() {
				this.authToken = null;
				this.user = null;
				this.favEvents = [];
				this.availableSlots = [];
				this.bookedEvents = null;
				this.isRegistered = null;
				this.volunteerEventSpaces = [];
				this.bboDiscordInvite = null;
				this.$dispatch("toast", "You have been logged out");
			},
			async getUserData(token) {
				token = token || this.authToken;
				let user = await fetchData("/users/me", {}, token);
				const userMetadata = metadataArrayToObject(user.metadata);
				const userRoles = [
					...userMetadata.wp_goplaynw_capabilities.matchAll(
						/"([a-z]+)/g
					),
				].map((match) => match[1]);
				user = {
					...user,
					metadata: userMetadata,
					roles: userRoles,
				};
				this.user = user;
				return user;
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
			async getEvent(id) {
				const data = await fetchData("/events/find", {
					method: "POST",
					body: { id: id },
				});
				// Create Javascript date object
				const eventStartDateTime = dayjs(
					data.eventStartDate + "T" + data.eventStartTime + "-07:00"
				).toDate();
				const eventEndDateTime = dayjs(
					data.eventEndDate + "T" + data.eventEndTime + "-07:00"
				).toDate();
				return {
					...data,
					// Convert to keyed object
					metadata: metadataArrayToObject(data.metadata),
					// strip out status 0 which are canceled attendees
					bookings: data?.bookings?.filter(
						(booking) => booking.bookingStatus === 1
					),
					// add simple isVolunteer boolean
					isVolunteer: data?.categories?.some(
						(cat) => cat.slug === "volunteer-shift"
					),
					// add javascript date objects and duration
					eventStartDateTime: eventStartDateTime,
					eventEndDateTime: eventEndDateTime,
					eventDuration: duration(
						eventStartDateTime,
						eventEndDateTime
					),
				};
			},
			async getBookedEvents() {
				// 1. Get ID array of my events
				let myEvents = await fetchData("/events/me/", {});
				// 2. Get event data for each ID
				myEvents = await Promise.all(
					myEvents.map(async (id) => {
						const event = await this.getEvent(id);
						return event;
					})
				);
				this.bookedEvents = myEvents;
				return myEvents;
			},
			async bookEvent(id) {
				let data = await fetchData("/bookings/bookMeIntoGame", {
					method: "POST",
					body: { gameId: id },
				});
				if (!data)
					this.$dispatch("toast", "ERROR: booking change failed");
				if (data.status != null && data.status === "FAILURE") {
					this.$dispatch("toast", "ERROR: " + data.message);
				}
				if (data) this.getBookedEvents();
				return data;
			},
			async cancelBooking(id) {
				let data = await fetchData("/bookings/removeMeFromGame", {
					method: "DELETE",
					body: { gameId: id, guid: id },
				});
				if (!data)
					this.$dispatch("toast", "ERROR: booking change failed");
				if (data) this.getBookedEvents();
				return data;
			},
			async getFavEvents() {
				let data = await fetchData("/events/me/favorites");
				this.favEvents = data && data.map((item) => item.eventId);
				return data && data.map((item) => item.eventId);
			},
			async toggleFav(id) {
				let data;
				if (this.isFav(id)) {
					data = await fetchData("/events/me/favorite/delete", {
						method: "DELETE",
						body: { eventId: id },
					});
				} else {
					data = await fetchData("/events/me/favorite/create", {
						method: "POST",
						body: { eventId: id },
					});
				}
				if (data && data.status === "FAILURE")
					this.$dispatch("toast", data.message);
				if (data && data.status === "SUCCESS") {
					this.getFavEvents();
				}
			},
			async getEventSignupData() {
				let data = await fetchData("/events/eventdata");
				console.log("getEventSignupData", data);
				return data;
			},
			async getEventVolunteerData() {
				let data = await fetchData("/events/volunteerdata");
				console.log("getEventSignupData", data);
				return data;
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
					this.bookedEvents.some((item) => item.eventId === id)
				);
			},
			async changePassword(userId, password) {
				let data = await fetchData("/users/setMyPassword", {
					method: "POST",
					body: { userId: userId, password: password },
				});
				return data;
			},
		};
	});

	/* -------------------------------------------------------------------------- */
	/*                            Alpine Component Data                           */
	/* -------------------------------------------------------------------------- */

	/* -------------------------- eventInfo panel data -------------------------- */

	Alpine.data("eventInfo", function () {
		return {
			spacesTotal: null,
			spacesOpen: null,
			owner: null,
			gm: null,
			bookings: [], // bookings minus all GMs
			events: this.$persist({}),
			async getEventBooking(id) {
				// Check localStorage first to quickly populate this
				let eventsLS = localStorage.getItem("events");
				let events = eventsLS ? JSON.parse(eventsLS) : false;
				if (events[id]) {
					// set Alpine 'eventInfo' variables
					this.owner = events[id].owner;
					this.gm = events[id].gm;
					this.bookings = events[id].bookings;
					this.spacesTotal = events[id].spacesTotal;
					this.spacesOpen = events[id].spacesOpen;
				}
				// fetch new data from server
				const data = await fetchData("/events/find", {
					method: "POST",
					body: { id: id },
				});
				if (data) {
					// Convert metadata array to object
					const metadata = metadataArrayToObject(data.metadata);
					// set Alpine 'eventInfo' variables
					this.owner = data.eventOwner.displayName;
					this.gm = metadata.GM;
					// filter out all cancelled bookings and GM roles
					const bookings = data.bookings.filter(
						(booking) =>
							booking.bookingStatus === 1 &&
							booking.bookingComment !== "GM"
					);
					this.bookings = bookings;
					this.spacesTotal = parseInt(metadata.Players);
					this.spacesOpen =
						parseInt(metadata.Players) - bookings.length;

					// get and reset localStorage with new data
					eventsLS = localStorage.getItem("events");
					events = eventsLS ? JSON.parse(eventsLS) : {};
					events = {
						...events,
						[id]: {
							owner: this.owner,
							gm: this.gm,
							bookings: this.bookings,
							spacesTotal: this.spacesTotal,
							spacesOpen: this.spacesOpen,
						},
					};
					localStorage.setItem("events", JSON.stringify(events));
				}
			},
			async uploadImage(e) {
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
					let event = this.events[eventId];
					event.metadata.event_image = data.fileName;
					this.events = { ...this.events, [eventId]: event };
				}
				location.reload();
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
		agreeCoC: false,
		agreeAge: false,
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
				const res = await fetch(
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
				const res = await fetch(
					`/.netlify/functions/forgot-password/?email=${paramSafeEmail}`
				)
					.then(function (response) {
						return response.text();
					})
					.then(function (data) {
						return data;
					});
				if (res && res === "forgot password email sent") {
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
				const res = await fetch(
					`/.netlify/functions/change-password/?uuid=${this.uuid}&email=${paramSafeEmail}&password=${this.userPass}`
				)
					.then(function (response) {
						return response.text();
					})
					.then(function (data) {
						return data;
					});
				if (res && res === "password changed") {
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
