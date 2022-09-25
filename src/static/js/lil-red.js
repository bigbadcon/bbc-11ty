(function (root, factory) {
	/*eslint-disable */
	// Ignoring this as it relies on checking this variables to see how to add/init the plugin.
	if (typeof define === "function" && define.amd) {
		define([], factory(root));
	} else if (typeof exports === "object") {
		module.exports = factory(root);
	} else {
		root.lilRed = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
	/*eslint-enable */

	"use strict";

	/* -------------------------------------------------------------------------- */
	/*                                  Variables                                 */
	/* -------------------------------------------------------------------------- */

	// eslint-disable-next-line no-unused-vars
	const window = root; // Map window to root to avoid confusion
	let publicMethods = {}; // Placeholder for public methods

	// Default settings
	const lilRedDefaults = {
		lilRedApiUrl: null,
	};

	// Settings
	let lilRedSettings;

	// Local storage keys
	const AUTH_TOKEN = "lilRedAuthToken";
	const LAST_LOGIN = "lilRedLastLogin";

	// simple text variables
	const GET = "GET";
	const POST = "POST";
	const PUT = "PUT";
	const DELETE = "DELETE";

	/* -------------------------------------------------------------------------- */
	/*                               Private Methods                              */
	/* -------------------------------------------------------------------------- */

	/**
	 * fetcher - basic fetch routine
	 * @private
	 */
	async function fetcher(url, options) {
		/* eslint-disable no-console */
		try {
			let response = await fetch(url, options);
			console.log(`RESPONSE:lilFetch for ${url}`, response);
			if (response.status !== 200) throw new Error(`fetch fail status: ${response.status}`);
			const contentType = response.headers.get("content-type");
			// Return JSON if it is JSON otherwise text
			const result =
				contentType && contentType.indexOf("application/json") !== -1
					? await response.json()
					: await response.text();
			console.log(`RESULT:lilFetch for ${url}`, result);
			return result;
		} catch (err) {
			console.error(`ERROR:lilFetch for ${url}`, err);
			return null;
		}
		/* eslint-enable no-console */
	}

	/**
	 * lilRedAuth - lilRed Targeted Fetch
	 * @private
	 */
	async function lilAuth(username, password) {
		console.log("lilAuth", username, password, lilRedSettings.lilRedApiUrl);
		if (!lilRedSettings && lilRedSettings.lilRedApiUrl) return false;
		const url = lilRedSettings.lilRedApiUrl + "/login";
		const options = {
			method: POST,
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		};
		try {
			let response = await fetch(url, options);
			if (response.status === 200 && response.headers.get("authorization")) {
				const token = response.headers.get("authorization");
				localStorage.setItem(AUTH_TOKEN, token);
				localStorage.setItem(LAST_LOGIN, new Date().toISOString());
				return token;
			}
		} catch (err) {
			/* eslint-disable-next-line no-console */
			console.error(`Lil Red Login Failed`, err);
			return null;
		}
	}

	/**
	 * lilFetch - lilRed Targeted Fetch
	 * @private
	 */
	//api = "/", method = GET, body, jsonStringify = true
	async function lilFetch(settings = {}) {
		console.log("lilFetch", settings, lilRedSettings);
		if (!lilRedSettings && lilRedSettings.lilRedApiUrl) return false;

		console.log("lilFetch post settings", settings, lilRedSettings.lilRedApiUrl);

		if (!lilRedSettings.lilRedApiUrl || !settings.api) return false;

		/* eslint-disable no-unused-vars */
		const url = lilRedSettings.lilRedApiUrl + settings.api;
		const options = {
			method: settings.method || GET,
			headers: {},
		};
		// JSON string it by default; this allows for just passing a formData object if desired
		if (settings.jsonStringify) {
			settings.body = settings.body && JSON.stringify(settings.body);
			options.headers["Content-Type"] = "application/json;charset=utf-8";
		}
		// Add body if there
		if (settings.body) options.body = settings.body;
		// If has api is more than just the base and it is not public access, then add authorization headers token
		if (settings.api !== "/" && !/public/.test(settings.api)) {
			options.headers.Authorization = lilRedSettings.token || settings.token || localStorage.getItem(AUTH_TOKEN);
		}
		let response = await fetcher(url, options);
		return response;
	}

	const go = {
		get: (api, token) => lilFetch({ api: api, method: GET, token: token }),
		post: (api, body, token) =>
			lilFetch({
				api: api,
				method: POST,
				body: JSON.stringify(body),
				token: token,
			}),
		put: (api, body, token) =>
			lilFetch({
				api: api,
				method: PUT,
				body: JSON.stringify(body),
				token: token,
			}),
		delete: (api, body, token) =>
			lilFetch({
				api: api,
				method: DELETE,
				body: JSON.stringify(body),
				token: token,
			}),
	};

	/* -------------------------------------------------------------------------- */
	/*                               Public Methods                               */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                            Fetch Public Methods                            */
	/* -------------------------------------------------------------------------- */

	/**
	 * lilRed Public API Fetch
	 * @public
	 */

	publicMethods = {
		...publicMethods,
		...go,
		// Basic Fetch options
		fetcher: (url, options) => fetcher(url, options),
		lilFetch: (settings) => lilFetch(settings),
		// Lil Red Specific
		login: (username, password) => lilAuth(username, password),
		logout: () => {
			localStorage.removeItem(AUTH_TOKEN);
			localStorage.removeItem(LAST_LOGIN);
		},
		status: () => go.get("/"),
		isAdmin: () => go.get("/users/me/isadmin"),
		me: () => go.get("/users/me"),
		bookings: {
			slots: () => go.get("/bookings/myAvailableSlots"),
			get: () => go.get("/events/me"),
			add: (id) => go.post("/bookings/bookMeIntoGame", { gameId: id }),
			delete: (id) =>
				go.delete("/bookings/removeMeFromGame", {
					gameId: id,
				}),
		},
		favorites: {
			get: () => go.get("/events/me/favorites"),
			add: (id) =>
				go.post("/events/me/favorite/create", {
					eventId: id,
				}),
			delete: (id) =>
				go.delete("/events/me/favorite/delete", {
					eventId: id,
				}),
		},
		password: {
			// TODO: sort all this out and make sure it works
			set: (id, password) =>
				go.post("/users/setMyPassword", {
					userId: id,
					password: password,
				}),
			resetRequest: (email) =>
				go.post("/users/resetPasswordRequest", {
					email: email,
				}),
			request: (emailAddress, emailBody, emailSubject) =>
				go.post("/password/request", {
					emailAddress: emailAddress,
					emailBody: emailBody,
					emailSubject: emailSubject,
				}),
			reset: (emailAddress, password, uuid) =>
				go.post("/password/reset", {
					emailAddress: emailAddress,
					password: password,
					uuid: uuid,
				}),
			confirm: (password, token) =>
				go.post("/users/confirmPasswordRequest", {
					password: password,
					token: token,
				}),
		},
		events: {
			find: (id) => go.post("/events/find", { id: id }),
			all: () => go.get("/events/all"),
			category: (category) => go.get(`/events/category/${category}`),
			count: () => go.get("/events/count"),
			create: (body) => go.put("/users/setMyPassword", body),
			// TODO: look into creating formData from an object
			uploadImage: (formData) =>
				lilFetch({
					api: "/events/image",
					method: POST,
					body: formData,
					jsonStringify: true,
				}), // must contain file and eventID as formData
			currentYear: (length, offset) => go.get(`/events/page/${length}/${offset}`),
			since: (epochtime) => go.get(`/events/since/${epochtime}`),
			// priorYear "events-for-year-controller" which isn't as useful
		},
		admin: {
			// TODO: complete all this
			roles: {
				add: (id, role) =>
					go.post("/events/addRoleToUser", {
						userId: id,
						role: role,
					}),
				delete: (id, role) =>
					go.post("/events/removeRoleFormUser", {
						userId: id,
						role: role,
					}),
			},
			users: {
				all: () => {},
				create: () => {},
				findById: () => {},
				findByEmail: () => {},
				setPassword: () => {},
			},
			bookings: {
				add: () => {},
				delete: () => {},
				setGm: () => {},
			},
		},
		public: {
			events: {
				all: () => lilFetch("/events/all/public"),
				currentYear: (id, offset) => go.get(`/events/page/public/${length}/${offset}`),
			},
			spaces: () => go.get("/events/spaces/public"),
			space: (id) => go.get(`/events/${id}/spaces/public`),
			currentYear: (length, offset) => go.get(`/events/page/public/${length}/${offset}`),
		},
	};

	/**
	 * Another public method
	 */
	publicMethods.init = function (lilRedOptions) {
		// Merge user options with defaults
		// settings = extend(defaults, options || {});
		lilRedSettings = { ...lilRedDefaults, ...lilRedOptions };

		// eslint-disable-next-line
		console.log("🐺 Initializing Lil Red Fetch", lilRedSettings);

		// Code goes here...
		//
	};

	//
	// Public APIs
	//

	return publicMethods;
});
