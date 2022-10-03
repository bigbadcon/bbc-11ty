var lilRed = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    admin: () => admin,
    bookings: () => bookings,
    decodeText: () => decodeText,
    destroy: () => destroy,
    events: () => events,
    favorites: () => favorites,
    fetcher: () => fetcher,
    init: () => init,
    isAdmin: () => isAdmin,
    lilDelete: () => lilDelete,
    lilFetch: () => lilFetch,
    lilGet: () => lilGet,
    lilPost: () => lilPost,
    lilPut: () => lilPut,
    login: () => login,
    logout: () => logout,
    me: () => me,
    password: () => password,
    roles: () => roles,
    status: () => status
  });
  var lilRedDefaults = {
    lilRedApiUrl: null,
    logoutIfStale: true,
    daysTillLogout: 10,
    serverApiKey: null
  };
  var lilRedSettings;
  var AUTH_TOKEN = "lilRedAuthToken";
  var LAST_LOGIN = "lilRedLastLogin";
  function dispatch(name, detail, additional, bubbles = true) {
    if (typeof detail === "string" && /^ERROR/.test(detail)) {
      if (additional) {
        console.error(name, detail, additional);
      } else {
        console.error(name, detail, additional);
      }
    } else {
      if (additional) {
        console.log(name, detail);
      } else {
        console.log(name, detail);
      }
    }
    document.dispatchEvent(
      new CustomEvent(name, {
        bubbles,
        detail
      })
    );
  }
  var decodeText = (text) => {
    try {
      const windows1252 = new TextEncoder("windows-1251");
      const utf8 = new TextDecoder();
      return text && utf8.decode(windows1252.encode(text));
    } catch (error) {
      console.error("decodeText: " + error);
      return text;
    }
  };
  async function fetcher(url, options) {
    try {
      let response = await fetch(url, options);
      console.log(`RESPONSE:lilFetch for ${url}`, response);
      if (response.status !== 200)
        throw new Error(`fetch fail status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      const result = contentType && contentType.indexOf("application/json") !== -1 ? await response.json() : await response.text();
      console.log(`RESULT: lilFetch for ${url}`, result);
      return result;
    } catch (err) {
      dispatch("lil-red-fetch-error", `ERROR: lilFetch for ${url} failed`, err);
      return null;
    }
  }
  async function lilAuth(username, password2) {
    if (!lilRedSettings && lilRedSettings.lilRedApiUrl)
      return null;
    const url = lilRedSettings.lilRedApiUrl + "/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify({
        username,
        password: password2
      })
    };
    try {
      let response = await fetch(url, options);
      if (response.status === 200 && response.headers.get("authorization")) {
        const token = response.headers.get("authorization");
        localStorage.setItem(AUTH_TOKEN, token);
        localStorage.setItem(LAST_LOGIN, new Date().toISOString());
        dispatch("lil-red-login", "success");
        return token;
      }
    } catch (err) {
      dispatch("lil-red-login", "fail");
      return null;
    }
  }
  async function lilFetch(settings) {
    settings = { jsonStringify: true, method: "GET", publicMethod: false, ...settings };
    if (!lilRedSettings?.lilRedApiUrl || !settings.api)
      return null;
    const publicMethod = settings.publicMethod || settings.api === "/" || /public/.test(settings.api);
    const serverApiKey = settings.serverApiKey || lilRedSettings.serverApiKey;
    const url = lilRedSettings.lilRedApiUrl + settings.api;
    const options = {
      method: settings.method,
      headers: {}
    };
    if (settings.jsonStringify) {
      settings.body = settings.body && JSON.stringify(settings.body);
      options.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    if (settings.body)
      options.body = settings.body;
    if (!publicMethod && !settings.serverApiKey) {
      const authToken = settings.token || localStorage.getItem(AUTH_TOKEN);
      if (authToken) {
        options.headers.Authorization = authToken;
      } else {
        dispatch("lil-red-fetch", "ERROR: auth token missing");
        return null;
      }
      if (lilRedSettings.logoutIfStale) {
        const lastLogin = Date.parse(localStorage.getItem(LAST_LOGIN));
        const now = new Date();
        const daysTillLogout = lilRedSettings.daysTillLogout || 10;
        const earliestAllowedLogin = Date.parse(new Date(now.setDate(now.getDate() - daysTillLogout)));
        const isStale = isNaN(lastLogin) || isNaN(earliestAllowedLogin) || lastLogin < earliestAllowedLogin;
        if (isStale) {
          dispatch("lil-red-fetch", `ERROR: auth token stale. Last Login: ${lastLogin}`);
          logout();
          return null;
        }
      }
      options.headers.Authorization = authToken;
    }
    if (!publicMethod && serverApiKey) {
      options.headers["x-api-key"] = serverApiKey;
    }
    let response = await fetcher(url, options);
    return response;
  }
  var lilGet = (api, settings) => lilFetch({ api, ...settings });
  var lilPost = (api, body, settings) => lilFetch({
    api,
    method: "POST",
    body,
    ...settings
  });
  var lilPut = (api, body, settings) => lilFetch({
    api,
    method: "PUT",
    body,
    ...settings
  });
  var lilDelete = (api, body, settings) => lilFetch({
    api,
    method: "DELETE",
    body,
    ...settings
  });
  async function init(lilRedOptions) {
    destroy();
    lilRedSettings = { ...lilRedDefaults, ...lilRedOptions };
    console.log("\u{1F43A} Initializing LilRed", lilRedSettings);
    dispatch("lil-red-init", `Initializing Lil Red: ${lilRedSettings.lilRedApiUrl}`);
    return await status();
  }
  function destroy() {
    const oldApiUrl = lilRedSettings?.lilRedApiUrl;
    lilRedSettings = lilRedDefaults;
    if (oldApiUrl) {
      dispatch("lil-red-destroy", `Deinitialized -- no longer using ${oldApiUrl}`);
    }
  }
  var status = async () => {
    const result = await lilGet("/");
    dispatch("lil-red-status", result);
    return result;
  };
  var login = (username, password2) => lilAuth(username, password2);
  var logout = () => {
    dispatch("lil-red-logout", "You have been logged out of Lil Red");
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(LAST_LOGIN);
  };
  var isAdmin = () => lilGet("/users/me/isadmin");
  var me = () => lilGet("/users/me");
  var roles = async (user) => {
    user = user || await lilGet("/users/me");
    const capabilities = user.metadata.find((md) => /capabilities/.test(md.metaKey)).metaValue;
    const roles2 = [...capabilities.matchAll(/"([a-z-]+)/g)].map((match) => match[1]);
    return roles2;
  };
  var bookings = {
    slots: () => lilGet("/bookings/myAvailableSlots"),
    get: () => lilGet("/events/me"),
    add: (id) => lilPost("/bookings/bookMeIntoGame", { gameId: Number(id) }),
    delete: (id) => lilDelete("/bookings/removeMeFromGame", {
      gameId: Number(id)
    }),
    event: async (id, event) => {
      if (!event)
        event = await events.find(id);
      const bookings2 = event.bookings.filter((booking) => booking.bookingStatus === 1).map((booking) => {
        return {
          ...booking,
          user: {
            ...booking.user,
            displayName: decodeText(booking.user.displayName)
          }
        };
      });
      const facilitator = bookings2.filter((booking) => booking.bookingComment).sort((a, b) => a.user.displayName.localeCompare(b.user.displayName)) || [];
      const attendees = bookings2.filter((booking) => !booking.bookingComment).sort((a, b) => a.user.displayName.localeCompare(b.user.displayName)) || [];
      return {
        facilitator,
        attendees
      };
    }
  };
  var favorites = {
    get: () => lilGet("/events/me/favorites"),
    add: (id) => lilPost("/events/me/favorite/create", {
      eventId: Number(id)
    }),
    delete: (id) => lilDelete("/events/me/favorite/delete", {
      eventId: Number(id)
    })
  };
  var password = {
    set: (id, password2) => lilPost("/users/setMyPassword", {
      userId: Number(id),
      password: password2
    }),
    requestReset: (email) => lilPost("/users/resetPasswordRequest", {
      email
    }),
    mailRequest: (emailAddress, emailBody, emailSubject) => lilPost("/password/request", {
      emailAddress,
      emailBody,
      emailSubject
    }),
    reset: (emailAddress, password2, uuid) => lilPost("/password/reset", {
      emailAddress,
      password: password2,
      uuid
    }),
    confirm: (password2, token) => lilPost("/users/confirmPasswordRequest", {
      password: password2,
      token
    })
  };
  var events = {
    me: () => lilGet("/events/me"),
    find: (id) => lilPost("/events/find", { id: Number(id) }),
    all: () => lilGet("/events/all"),
    category: (category) => lilGet(`/events/category/${category}`),
    count: () => lilGet("/events/count"),
    create: (body) => lilPut("/users/setMyPassword", body),
    uploadImage: (formData) => {
      lilFetch({
        api: "/events/image",
        method: "POST",
        body: formData,
        jsonStringify: false
      });
    },
    currentYear: (length, offset) => lilGet(`/events/page/${length}/${offset}`),
    since: (epochtime) => lilGet(`/events/since/${epochtime}`),
    public: {
      all: () => lilGet("/events/all/public"),
      currentYear: (length, offset) => lilGet(`/events/page/public/${length}/${offset}`),
      spaces: () => lilGet("/events/spaces/public"),
      space: (id) => lilGet(`/events/${id}/spaces/public`),
      categories: async (events2) => {
        events2 = events2 || await lilGet("/events/all/public");
        const allCategories = events2.reduce((acc, cur) => {
          const simpleArray = cur.categories.map((cat) => cat.name) || [];
          return [...acc, ...simpleArray];
        }, []);
        const uniqueCategories = [...new Set(allCategories)];
        return uniqueCategories;
      }
    }
  };
  var admin = {
    roles: {
      add: (id, role) => lilPost("/events/addRoleToUser", {
        userId: Number(id),
        role
      }),
      delete: (id, role) => lilPost("/events/removeRoleFormUser", {
        userId: Number(id),
        role
      })
    },
    users: {
      all: () => lilGet("/users/all"),
      create: (body) => lilPut("/users/create", body),
      findById: (id) => lilGet(`/users/id/${id}`),
      findByEmail: (email) => lilGet(`/users/email/${email}`),
      setPassword: (id, password2) => lilPost("/users/setPassword", { password: password2, userId: id })
    },
    bookings: {
      add: () => {
      },
      delete: () => {
      },
      setGm: () => {
      }
    }
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=lil-red.js.map
