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
    status: () => status
  });
  var lilRedDefaults = {
    lilRedApiUrl: null,
    logoutIfStale: true,
    daysTillLogout: 10
  };
  var lilRedSettings;
  var AUTH_TOKEN = "lilRedAuthToken";
  var LAST_LOGIN = "lilRedLastLogin";
  function dispatch(name, detail, bubbles = true) {
    if (typeof detail === "string" && /^ERROR/.test(detail)) {
      console.error(name, detail);
    } else {
      console.log(name, detail);
    }
    document.dispatchEvent(
      new CustomEvent(name, {
        bubbles,
        detail
      })
    );
  }
  async function fetcher(url, options) {
    try {
      let response = await fetch(url, options);
      console.log(`RESPONSE:lilFetch for ${url}`, response);
      if (response.status !== 200)
        throw new Error(`fetch fail status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      const result = contentType && contentType.indexOf("application/json") !== -1 ? await response.json() : await response.text();
      console.log(`RESULT:lilFetch for ${url}`, result);
      return result;
    } catch (err) {
      console.error(`ERROR:lilFetch for ${url}`, err);
      return null;
    }
  }
  async function lilAuth(username, password2) {
    if (!lilRedSettings && lilRedSettings.lilRedApiUrl)
      return false;
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
        dispatch("lilRed_login", "success");
        return token;
      }
    } catch (err) {
      dispatch("lilRed_login", "fail");
      return null;
    }
  }
  async function lilFetch(settings) {
    settings = { jsonStringify: true, method: "GET", ...settings };
    if (!lilRedSettings && lilRedSettings.lilRedApiUrl)
      return false;
    if (!lilRedSettings.lilRedApiUrl || !settings.api)
      return false;
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
    if (settings.api !== "/" && !/public/.test(settings.api)) {
      const authToken = settings.token || lilRedSettings.token || localStorage.getItem(AUTH_TOKEN);
      if (authToken) {
        options.headers.Authorization = authToken;
      } else {
        dispatch("lilRed_lilFetch", "ERROR: auth token missing");
        return null;
      }
      if (lilRedSettings.logoutIfStale) {
        const lastLogin = Date.parse(localStorage.getItem(LAST_LOGIN));
        const now = new Date();
        const daysTillLogout = lilRedSettings.daysTillLogout || 10;
        const earliestAllowedLogin = Date.parse(
          new Date(now.setDate(now.getDate() - daysTillLogout))
        );
        const isStale = isNaN(lastLogin) || isNaN(earliestAllowedLogin) || lastLogin < earliestAllowedLogin;
        if (isStale) {
          dispatch(
            "lilRed_lilFetch",
            `ERROR: auth token stale. Last Login: ${lastLogin}`
          );
          logout();
          return null;
        }
      }
      options.headers.Authorization = authToken;
    }
    let response = await fetcher(url, options);
    return response;
  }
  var lilGet = (api, token) => lilFetch({ api, token });
  var lilPost = (api, body, token) => lilFetch({
    api,
    method: "POST",
    body,
    token
  });
  var lilPut = (api, body, token) => lilFetch({
    api,
    method: "PUT",
    body,
    token
  });
  var lilDelete = (api, body, token) => lilFetch({
    api,
    method: "DELETE",
    body,
    token
  });
  function init(lilRedOptions) {
    lilRedSettings = { ...lilRedDefaults, ...lilRedOptions };
    console.log("\u{1F43A} Initializing Lil Red Fetch", lilRedSettings);
  }
  var status = async () => {
    const result = await lilGet("/");
    dispatch("lilRed_status", result);
    return result;
  };
  var isAdmin = () => lilGet("/users/me/isadmin");
  var login = (username, password2) => lilAuth(username, password2);
  var logout = () => {
    dispatch("lilRed_logout", "You have been logged out of Lil Red");
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(LAST_LOGIN);
  };
  var me = () => lilGet("/users/me");
  var bookings = {
    slots: () => lilGet("/bookings/myAvailableSlots"),
    get: () => lilGet("/events/me"),
    add: (id) => lilPost("/bookings/bookMeIntoGame", { gameId: Number(id) }),
    delete: (id) => lilDelete("/bookings/removeMeFromGame", {
      gameId: Number(id)
    })
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
    resetRequest: (email) => lilPost("/users/resetPasswordRequest", {
      email
    }),
    request: (emailAddress, emailBody, emailSubject) => lilPost("/password/request", {
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
    spaces: () => lilGet("/events/spaces/public"),
    space: (id) => lilGet(`/events/${id}/spaces/public`),
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
      all: () => lilFetch("/events/all/public"),
      currentYear: (length, offset) => lilGet(`/events/page/public/${length}/${offset}`)
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
      all: () => {
      },
      create: () => {
      },
      findById: () => {
      },
      findByEmail: () => {
      },
      setPassword: () => {
      }
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
