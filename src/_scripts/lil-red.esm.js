var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/utf8@3.0.0/node_modules/utf8/utf8.js
var require_utf8 = __commonJS({
  "node_modules/.pnpm/utf8@3.0.0/node_modules/utf8/utf8.js"(exports) {
    (function(root) {
      var stringFromCharCode = String.fromCharCode;
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        var value;
        var extra;
        while (counter < length) {
          value = string.charCodeAt(counter++);
          if (value >= 55296 && value <= 56319 && counter < length) {
            extra = string.charCodeAt(counter++);
            if ((extra & 64512) == 56320) {
              output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      function ucs2encode(array) {
        var length = array.length;
        var index = -1;
        var value;
        var output = "";
        while (++index < length) {
          value = array[index];
          if (value > 65535) {
            value -= 65536;
            output += stringFromCharCode(value >>> 10 & 1023 | 55296);
            value = 56320 | value & 1023;
          }
          output += stringFromCharCode(value);
        }
        return output;
      }
      function checkScalarValue(codePoint) {
        if (codePoint >= 55296 && codePoint <= 57343) {
          throw Error(
            "Lone surrogate U+" + codePoint.toString(16).toUpperCase() + " is not a scalar value"
          );
        }
      }
      function createByte(codePoint, shift) {
        return stringFromCharCode(codePoint >> shift & 63 | 128);
      }
      function encodeCodePoint(codePoint) {
        if ((codePoint & 4294967168) == 0) {
          return stringFromCharCode(codePoint);
        }
        var symbol = "";
        if ((codePoint & 4294965248) == 0) {
          symbol = stringFromCharCode(codePoint >> 6 & 31 | 192);
        } else if ((codePoint & 4294901760) == 0) {
          checkScalarValue(codePoint);
          symbol = stringFromCharCode(codePoint >> 12 & 15 | 224);
          symbol += createByte(codePoint, 6);
        } else if ((codePoint & 4292870144) == 0) {
          symbol = stringFromCharCode(codePoint >> 18 & 7 | 240);
          symbol += createByte(codePoint, 12);
          symbol += createByte(codePoint, 6);
        }
        symbol += stringFromCharCode(codePoint & 63 | 128);
        return symbol;
      }
      function utf8encode(string) {
        var codePoints = ucs2decode(string);
        var length = codePoints.length;
        var index = -1;
        var codePoint;
        var byteString = "";
        while (++index < length) {
          codePoint = codePoints[index];
          byteString += encodeCodePoint(codePoint);
        }
        return byteString;
      }
      function readContinuationByte() {
        if (byteIndex >= byteCount) {
          throw Error("Invalid byte index");
        }
        var continuationByte = byteArray[byteIndex] & 255;
        byteIndex++;
        if ((continuationByte & 192) == 128) {
          return continuationByte & 63;
        }
        throw Error("Invalid continuation byte");
      }
      function decodeSymbol() {
        var byte1;
        var byte2;
        var byte3;
        var byte4;
        var codePoint;
        if (byteIndex > byteCount) {
          throw Error("Invalid byte index");
        }
        if (byteIndex == byteCount) {
          return false;
        }
        byte1 = byteArray[byteIndex] & 255;
        byteIndex++;
        if ((byte1 & 128) == 0) {
          return byte1;
        }
        if ((byte1 & 224) == 192) {
          byte2 = readContinuationByte();
          codePoint = (byte1 & 31) << 6 | byte2;
          if (codePoint >= 128) {
            return codePoint;
          } else {
            throw Error("Invalid continuation byte");
          }
        }
        if ((byte1 & 240) == 224) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          codePoint = (byte1 & 15) << 12 | byte2 << 6 | byte3;
          if (codePoint >= 2048) {
            checkScalarValue(codePoint);
            return codePoint;
          } else {
            throw Error("Invalid continuation byte");
          }
        }
        if ((byte1 & 248) == 240) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          byte4 = readContinuationByte();
          codePoint = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
          if (codePoint >= 65536 && codePoint <= 1114111) {
            return codePoint;
          }
        }
        throw Error("Invalid UTF-8 detected");
      }
      var byteArray;
      var byteCount;
      var byteIndex;
      function utf8decode(byteString) {
        byteArray = ucs2decode(byteString);
        byteCount = byteArray.length;
        byteIndex = 0;
        var codePoints = [];
        var tmp;
        while ((tmp = decodeSymbol()) !== false) {
          codePoints.push(tmp);
        }
        return ucs2encode(codePoints);
      }
      root.version = "3.0.0";
      root.encode = utf8encode;
      root.decode = utf8decode;
    })(typeof exports === "undefined" ? exports.utf8 = {} : exports);
  }
});

// src/index.js
var import_utf8 = __toESM(require_utf8());
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
    return import_utf8.default.decode(text);
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
    const authToken2 = settings.token || localStorage.getItem(AUTH_TOKEN);
    if (authToken2) {
      options.headers.Authorization = authToken2;
    } else {
      dispatch("lil-red-fetch", `ERROR: auth token missing; attempted to fetch ${settings.api}`);
      return null;
    }
    if (lilRedSettings.logoutIfStale) {
      const lastLogin = Date.parse(localStorage.getItem(LAST_LOGIN));
      const now = new Date();
      const daysTillLogout = lilRedSettings.daysTillLogout || 10;
      const earliestAllowedLogin = Date.parse(new Date(now.setDate(now.getDate() - daysTillLogout)));
      const isStale = isNaN(lastLogin) || isNaN(earliestAllowedLogin) || lastLogin < earliestAllowedLogin;
      if (isStale) {
        dispatch(
          "lil-red-fetch",
          `ERROR: auth token stale. Last Login: ${lastLogin}; attempted to fetch ${settings.api}`
        );
        logout();
        return null;
      }
    }
    options.headers.Authorization = authToken2;
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
var apiUrl = () => lilRedSettings.lilRedApiUrl;
var isInit = () => typeof lilRedSettings.lilRedApiUrl === "string";
var login = (username, password2) => lilAuth(username, password2);
var logout = () => {
  dispatch("lil-red-logout", "You have been logged out of Lil Red");
  localStorage.removeItem(AUTH_TOKEN);
  localStorage.removeItem(LAST_LOGIN);
};
var authToken = () => localStorage.getItem(AUTH_TOKEN);
var isAuth = () => typeof localStorage.getItem(AUTH_TOKEN) === "string";
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
export {
  admin,
  apiUrl,
  authToken,
  bookings,
  decodeText,
  destroy,
  events,
  favorites,
  fetcher,
  init,
  isAdmin,
  isAuth,
  isInit,
  lilDelete,
  lilFetch,
  lilGet,
  lilPost,
  lilPut,
  login,
  logout,
  me,
  password,
  roles,
  status
};
/*! https://mths.be/utf8js v3.0.0 by @mathias */
