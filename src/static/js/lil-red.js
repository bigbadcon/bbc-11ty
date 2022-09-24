/* -------------------------------------------------------------------------- */
/*                              Lil Red API Fetch                             */
/* -------------------------------------------------------------------------- */

/* global lilRedAPIUrl */
/* The API url must end in a trailing / */
/* Either this is set as a global variable or stored in localStorage */
const APIUrl = lilRedAPIUrl || localStorage.getItem("lilRedAPIUrl");

// Local storage keys
const AUTH_TOKEN = "lilRedAuthToken";
const LAST_LOGIN = "lilRedAuthToken";

// simple text variables
const GET = "GET";
const POST = "POST";
const PUT = "PUT";
const DELETE = "DELETE";

async function lilFetch(url, options) {
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

async function lilRedAPI(api = "/", method = GET, body, jsonStringify = true) {
	/* eslint-disable no-unused-vars */
	const url = APIUrl + api;
	const options = {
		method: method,
		headers: {},
	};
	// JSON string it by default; this allows for just passing a formData object if desired
	if (jsonStringify) {
		body = body && JSON.stringify(body);
		options.headers["Content-Type"] = "application/json;charset=utf-8";
	}
	// Add body if there
	if (body) options.body = body;
	// If has api is more than just the base and it is not public access, then add authorization headers token
	if (api !== "/" && !/public/.test(api)) {
		options.headers.Authorization = localStorage.getItem(AUTH_TOKEN) || "";
	}
	let response = await lilFetch(url, options);
	return response;
}

async function lilRedAuth(username, password) {
	if (!APIUrl) return false;
	const url = APIUrl + "login";
	const options = {
		method: POST,
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		body: JSON.stringify({ username: username, password: password }),
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

const lilRed = {
	// Basic Fetch options
	fetch: (url, options) => lilFetch(url, options),
	get: (url) => lilRedAPI(url),
	post: (url, body) => lilRedAPI(url, POST, JSON.stringify(body)),
	delete: (url, body) => lilRedAPI(url, DELETE, JSON.stringify(body)),
	put: (url, body) => lilRedAPI(url, PUT, JSON.stringify(body)),
	// Lil Red Specific
	login: (username, password) => lilRedAuth(username, password),
	logout: () => {
		localStorage.removeItem(AUTH_TOKEN);
		localStorage.removeItem(LAST_LOGIN);
	},
	status: () => lilRedAPI("/"),
	user: {
		me: () => lilRedAPI("/users/me"),
		isAdmin: () => lilRedAPI("/users/me/isAdmin"),
		slots: () => lilRedAPI("/bookings/myAvailableSlots"),
		bookings: {
			get: () => lilRedAPI("/events/me"),
			add: (id) => lilRedAPI("/bookings/bookMeIntoGame", POST, { gameId: id }),
			delete: (id) => lilRedAPI("/bookings/removeMeFromGame", DELETE, { gameId: id }),
		},
		favorites: {
			get: () => lilRedAPI("/events/me/favorites"),
			add: (id) => lilRedAPI("/events/me/favorite/create", POST, { eventId: id }),
			delete: (id) => lilRedAPI("/events/me/favorite/delete", DELETE, { eventId: id }),
		},
		password: {
			// TODO: sort all this out and make sure it works
			set: (id, password) => lilRedAPI("/users/setMyPassword", POST, { userId: id, password: password }),
			resetRequest: (email) =>
				lilRedAPI("/users/resetPasswordRequest", POST, {
					email: email,
				}),
			request: (emailAddress, emailBody, emailSubject) =>
				lilRedAPI("/password/request", POST, {
					emailAddress: emailAddress,
					emailBody: emailBody,
					emailSubject: emailSubject,
				}),
			reset: (emailAddress, password, uuid) =>
				lilRedAPI("/password/reset", POST, {
					emailAddress: emailAddress,
					password: password,
					uuid: uuid,
				}),
			confirm: (password, token) =>
				lilRedAPI("/users/confirmPasswordRequest", POST, {
					password: password,
					token: token,
				}),
		},
		events: {
			find: (id) => lilRedAPI("/events/find", POST, { id: id }),
			all: () => lilRedAPI("/events/all"),
			category: (category) => lilRedAPI(`/events/category/${category}`),
			count: (category) => lilRedAPI("/events/count"),
			create: (body) => lilRedAPI("/users/setMyPassword", PUT, body),
			// TODO: look into creating formData from an object
			uploadImage: (formData) => lilRedAPI("/events/image", POST, formData, false), // must contain file and eventID as formData
			currentYear: (length, offset) => lilRedAPI(`/events/page/${length}/${offset}`),
			since: (epochtime) => lilRedAPI(`/events/since/${epochtime}`),
			// priorYear "events-for-year-controller" which isn't as useful
		},
	},
	admin: {
		addRoleToUser: () => {},
		users: {
			all: () => {},
			create: () => {},
			findById: () => {},
			findByEmail: () => {},
			removeRole: () => {},
			addRole: () => {},
			setPassword: () => {},
		},
		bookings: {
			addUserToGame: () => {},
			removeUserFromGame: () => {},
			setGmStatusForPlayerInGame: () => {},
		},
		events: {
			user: (id) => lilRedAPI("/events/find", POST, { id: id }),
		},
	},
	public: {
		events: {
			all: () => lilRedAPI("/events/all/public"),
			currentYear: (id, offset) => lilRedAPI(`/events/page/public/${length}/${offset}`),
		},
		spaces: () => lilRedAPI("/events/spaces/public"),
		space: (id) => lilRedAPI(`/events/${id}/spaces/public`),
		currentYear: (length, offset) => lilRedAPI(`/events/page/public/${length}/${offset}`),
	},
};
