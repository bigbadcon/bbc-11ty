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

// ../node_modules/.pnpm/utf8@3.0.0/node_modules/utf8/utf8.js
var require_utf8 = __commonJS({
  "../node_modules/.pnpm/utf8@3.0.0/node_modules/utf8/utf8.js"(exports) {
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

// ../node_modules/.pnpm/windows-1252@1.1.0/node_modules/windows-1252/windows-1252.js
var require_windows_1252 = __commonJS({
  "../node_modules/.pnpm/windows-1252@1.1.0/node_modules/windows-1252/windows-1252.js"(exports, module) {
    (function() {
      const stringFromCharCode = String.fromCharCode;
      const INDEX_BY_CODE_POINT = /* @__PURE__ */ new Map([[129, 1], [141, 13], [143, 15], [144, 16], [157, 29], [160, 32], [161, 33], [162, 34], [163, 35], [164, 36], [165, 37], [166, 38], [167, 39], [168, 40], [169, 41], [170, 42], [171, 43], [172, 44], [173, 45], [174, 46], [175, 47], [176, 48], [177, 49], [178, 50], [179, 51], [180, 52], [181, 53], [182, 54], [183, 55], [184, 56], [185, 57], [186, 58], [187, 59], [188, 60], [189, 61], [190, 62], [191, 63], [192, 64], [193, 65], [194, 66], [195, 67], [196, 68], [197, 69], [198, 70], [199, 71], [200, 72], [201, 73], [202, 74], [203, 75], [204, 76], [205, 77], [206, 78], [207, 79], [208, 80], [209, 81], [210, 82], [211, 83], [212, 84], [213, 85], [214, 86], [215, 87], [216, 88], [217, 89], [218, 90], [219, 91], [220, 92], [221, 93], [222, 94], [223, 95], [224, 96], [225, 97], [226, 98], [227, 99], [228, 100], [229, 101], [230, 102], [231, 103], [232, 104], [233, 105], [234, 106], [235, 107], [236, 108], [237, 109], [238, 110], [239, 111], [240, 112], [241, 113], [242, 114], [243, 115], [244, 116], [245, 117], [246, 118], [247, 119], [248, 120], [249, 121], [250, 122], [251, 123], [252, 124], [253, 125], [254, 126], [255, 127], [338, 12], [339, 28], [352, 10], [353, 26], [376, 31], [381, 14], [382, 30], [402, 3], [710, 8], [732, 24], [8211, 22], [8212, 23], [8216, 17], [8217, 18], [8218, 2], [8220, 19], [8221, 20], [8222, 4], [8224, 6], [8225, 7], [8226, 21], [8230, 5], [8240, 9], [8249, 11], [8250, 27], [8364, 0], [8482, 25]]);
      const INDEX_BY_POINTER = /* @__PURE__ */ new Map([[0, "\u20AC"], [1, "\x81"], [2, "\u201A"], [3, "\u0192"], [4, "\u201E"], [5, "\u2026"], [6, "\u2020"], [7, "\u2021"], [8, "\u02C6"], [9, "\u2030"], [10, "\u0160"], [11, "\u2039"], [12, "\u0152"], [13, "\x8D"], [14, "\u017D"], [15, "\x8F"], [16, "\x90"], [17, "\u2018"], [18, "\u2019"], [19, "\u201C"], [20, "\u201D"], [21, "\u2022"], [22, "\u2013"], [23, "\u2014"], [24, "\u02DC"], [25, "\u2122"], [26, "\u0161"], [27, "\u203A"], [28, "\u0153"], [29, "\x9D"], [30, "\u017E"], [31, "\u0178"], [32, "\xA0"], [33, "\xA1"], [34, "\xA2"], [35, "\xA3"], [36, "\xA4"], [37, "\xA5"], [38, "\xA6"], [39, "\xA7"], [40, "\xA8"], [41, "\xA9"], [42, "\xAA"], [43, "\xAB"], [44, "\xAC"], [45, "\xAD"], [46, "\xAE"], [47, "\xAF"], [48, "\xB0"], [49, "\xB1"], [50, "\xB2"], [51, "\xB3"], [52, "\xB4"], [53, "\xB5"], [54, "\xB6"], [55, "\xB7"], [56, "\xB8"], [57, "\xB9"], [58, "\xBA"], [59, "\xBB"], [60, "\xBC"], [61, "\xBD"], [62, "\xBE"], [63, "\xBF"], [64, "\xC0"], [65, "\xC1"], [66, "\xC2"], [67, "\xC3"], [68, "\xC4"], [69, "\xC5"], [70, "\xC6"], [71, "\xC7"], [72, "\xC8"], [73, "\xC9"], [74, "\xCA"], [75, "\xCB"], [76, "\xCC"], [77, "\xCD"], [78, "\xCE"], [79, "\xCF"], [80, "\xD0"], [81, "\xD1"], [82, "\xD2"], [83, "\xD3"], [84, "\xD4"], [85, "\xD5"], [86, "\xD6"], [87, "\xD7"], [88, "\xD8"], [89, "\xD9"], [90, "\xDA"], [91, "\xDB"], [92, "\xDC"], [93, "\xDD"], [94, "\xDE"], [95, "\xDF"], [96, "\xE0"], [97, "\xE1"], [98, "\xE2"], [99, "\xE3"], [100, "\xE4"], [101, "\xE5"], [102, "\xE6"], [103, "\xE7"], [104, "\xE8"], [105, "\xE9"], [106, "\xEA"], [107, "\xEB"], [108, "\xEC"], [109, "\xED"], [110, "\xEE"], [111, "\xEF"], [112, "\xF0"], [113, "\xF1"], [114, "\xF2"], [115, "\xF3"], [116, "\xF4"], [117, "\xF5"], [118, "\xF6"], [119, "\xF7"], [120, "\xF8"], [121, "\xF9"], [122, "\xFA"], [123, "\xFB"], [124, "\xFC"], [125, "\xFD"], [126, "\xFE"], [127, "\xFF"]]);
      const error = (codePoint, mode) => {
        if (mode == "replacement") {
          return "\uFFFD";
        }
        if (codePoint !== null && mode === "html") {
          return "&#" + codePoint + ";";
        }
        throw new Error();
      };
      const decode = (input, options) => {
        let mode;
        if (options && options.mode) {
          mode = options.mode.toLowerCase();
        }
        if (mode !== "replacement" && mode !== "fatal") {
          mode = "replacement";
        }
        const buffer = [];
        for (let index = 0; index < input.length; index++) {
          const byteValue = input.charCodeAt(index);
          if (byteValue >= 0 && byteValue <= 127) {
            buffer.push(stringFromCharCode(byteValue));
            continue;
          }
          const pointer = byteValue - 128;
          if (INDEX_BY_POINTER.has(pointer)) {
            buffer.push(INDEX_BY_POINTER.get(pointer));
          } else {
            buffer.push(error(null, mode));
          }
        }
        const result = buffer.join("");
        return result;
      };
      const encode = (input, options) => {
        let mode;
        if (options && options.mode) {
          mode = options.mode.toLowerCase();
        }
        if (mode !== "fatal" && mode !== "html") {
          mode = "fatal";
        }
        const buffer = [];
        for (let index = 0; index < input.length; index++) {
          const codePoint = input.charCodeAt(index);
          if (codePoint >= 0 && codePoint <= 127) {
            buffer.push(stringFromCharCode(codePoint));
            continue;
          }
          if (INDEX_BY_CODE_POINT.has(codePoint)) {
            const pointer = INDEX_BY_CODE_POINT.get(codePoint);
            buffer.push(stringFromCharCode(pointer + 128));
          } else {
            buffer.push(error(codePoint, mode));
          }
        }
        const result = buffer.join("");
        return result;
      };
      const windows12522 = {
        encode,
        decode,
        labels: [
          "ansi_x3.4-1968",
          "ascii",
          "cp1252",
          "cp819",
          "csisolatin1",
          "ibm819",
          "iso-8859-1",
          "iso-ir-100",
          "iso8859-1",
          "iso88591",
          "iso_8859-1",
          "iso_8859-1:1987",
          "l1",
          "latin1",
          "us-ascii",
          "windows-1252",
          "x-cp1252"
        ],
        version: "1.1.0"
      };
      module.exports = windows12522;
    })();
  }
});

// src/index.js
var import_utf8 = __toESM(require_utf8());
var import_windows_1252 = __toESM(require_windows_1252());
var lilRedDefaults = {
  lilRedApiUrl: null,
  statusResponse: "roll plus login",
  logoutIfStale: true,
  daysTillLogout: 10,
  serverApiKey: null,
  verbose: false
};
var lilRedSettings;
var auth = {
  token: null,
  lastLogin: null
};
var AUTH_TOKEN = "lilRedAuthToken";
var LAST_LOGIN = "lilRedLastLogin";
var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
function dispatch(name, detail, additional = "", bubbles = true) {
  if (name === "lil-red-error") {
    console.error(name, detail, additional);
  } else {
    console.log(name, detail, additional);
  }
  if (isBrowser()) {
    document.dispatchEvent(
      new CustomEvent(name, {
        bubbles,
        detail
      })
    );
  }
}
var decodeText = (text) => {
  try {
    text = import_windows_1252.default.encode(text, {
      mode: "html"
    });
    return import_utf8.default.decode(text);
  } catch (error) {
    return text;
  }
};
async function fetcher(url, options) {
  const apiPath = url.replace(lilRedSettings.lilRedApiUrl, "");
  try {
    let response = await fetch(url, options);
    if (lilRedSettings.verbose)
      console.log(`RESPONSE:lilFetch for ${apiPath}`, response);
    if (response.status === 401) {
      dispatch("lil-red-error", "(FETCH) Unauthorized or AuthToken invalid. Try logging out and back in.");
      return null;
    }
    if (!response || response.status !== 200)
      throw new Error(`fetch fail status: ${response.status}`);
    const contentType = response.headers.get("content-type");
    const result = contentType && contentType.indexOf("application/json") !== -1 ? await response.json() : await response.text();
    if (lilRedSettings.verbose)
      console.log(`RESULT: lilFetch for ${apiPath}`, result);
    return result;
  } catch (err) {
    if (apiPath !== "/") {
      dispatch("lil-red-error", `(FETCH) lilFetch failed for ${apiPath}`, err);
    }
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
    if (response.status === 401) {
      dispatch(
        "lil-red-error",
        "(LOGIN) Unauthorized. Either username or password is incorrect.",
        response.status
      );
      return null;
    }
    if (response.status === 200 && response.headers.get("authorization")) {
      const token = response.headers.get("authorization");
      const lastLogin = new Date().toISOString();
      auth = {
        token,
        lastLogin
      };
      if (isBrowser()) {
        localStorage.setItem(AUTH_TOKEN, token);
        localStorage.setItem(LAST_LOGIN, lastLogin);
      }
      dispatch("lil-red-login", "success", username);
      return token;
    }
    if (response.status !== 200)
      throw new Error(`fetch fail status: ${response.status}`);
  } catch (err) {
    dispatch("lil-red-error", "(LOGIN) Login failed", err);
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
    const tokenLS = isBrowser() ? localStorage.getItem(AUTH_TOKEN) : null;
    const authToken = settings.token || auth.token || tokenLS;
    if (authToken) {
      options.headers.Authorization = authToken;
    } else {
      dispatch(
        "lil-red-error",
        `(FETCH) AuthToken missing, you will be logged out. Please log back in and try again.`,
        settings.api
      );
      logout();
      return null;
    }
    if (lilRedSettings.logoutIfStale) {
      auth.lastLogin = auth.lastLogin || isBrowser() ? localStorage.getItem(LAST_LOGIN) : null;
      const lastLogin = Date.parse(auth.lastLogin);
      const now = new Date();
      const daysTillLogout = lilRedSettings.daysTillLogout || 10;
      const earliestAllowedLogin = Date.parse(new Date(now.setDate(now.getDate() - daysTillLogout)));
      const isStale = isNaN(lastLogin) || isNaN(earliestAllowedLogin) || lastLogin < earliestAllowedLogin;
      if (isStale) {
        dispatch(
          "lil-red-error",
          `(FETCH) Auth token stale. Last Login: ${lastLogin}. You will be logged out. Please log back in.`,
          settings.api
        );
        logout();
        return null;
      }
    }
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
  dispatch("lil-red-init", `Initializing Lil Red`, lilRedSettings);
  return lilRedOptions.lilRedApiUrl;
}
function destroy() {
  const oldApiUrl = lilRedSettings?.lilRedApiUrl;
  lilRedSettings = lilRedDefaults;
  if (oldApiUrl) {
    dispatch("lil-red-destroy", `Deinitialized`, oldApiUrl);
  }
  return true;
}
var status = async (maxCount = 1, delay = 5e3, multiplier = 1) => {
  if (isBrowser() && !navigator.onLine) {
    dispatch("lil-red-error", "You are not currently online", navigator.onLine);
    return false;
  }
  const successResponse = lilRedSettings.statusResponse;
  let status2;
  for (let i = 0; i < maxCount; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = multiplier * delay;
    }
    status2 = await lilGet("/");
    dispatch("lil-red-status", status2 === successResponse, `check: ${i + 1}`);
    if (status2 === successResponse)
      i = maxCount;
  }
  if (status2 !== successResponse) {
    dispatch("lil-red-error", "(STATUS) Little Red Event Manager not available", lilRedSettings?.lilRedApiUrl);
  }
  return status2;
};
var login = (username, password2) => lilAuth(username, password2);
var logout = () => {
  dispatch("lil-red-logout", "You have been logged out of Lil Red", new Date());
  auth = {};
  if (isBrowser()) {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(LAST_LOGIN);
  }
};
var isAdmin = () => lilGet("/users/me/isadmin");
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
  bookings: async (event) => {
    if (!isNaN(Number(event)))
      event = await lilPost("/events/find", { id: Number(event) });
    const bookings2 = event.bookings.filter((booking) => booking.bookingStatus === 1).map((booking) => {
      return {
        id: booking.user.id,
        displayName: decodeText(booking.user.displayName),
        bookingComment: booking.bookingComment
      };
    });
    const hosts = bookings2.filter((booking) => booking.bookingComment).sort((a, b) => a.displayName.localeCompare(b.displayName)) || [];
    const attendees = bookings2.filter((booking) => !booking.bookingComment).map((booking) => {
      return {
        id: booking.id,
        displayName: decodeText(booking.displayName)
      };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName)) || [];
    return {
      hosts,
      attendees
    };
  },
  all: () => lilGet("/events/all"),
  category: (category) => lilGet(`/events/category/${category}`),
  count: () => lilGet("/events/count"),
  create: (body) => lilPut("/events/create", body),
  uploadImage: async (formData) => lilFetch({
    api: "/events/image",
    method: "POST",
    body: formData,
    jsonStringify: false
  }),
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
    add: (id, role) => lilPost("/users/addRoleToUser", {
      userId: Number(id),
      role
    }),
    delete: (id, role) => lilPost("/users/removeRoleFromUser", {
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
    get: (userId) => lilPost("/events/user", { id: userId }),
    add: (eventId, userId, isGm = false) => lilPost("/bookings/addUserToGame", { eventId, userId, isGm }),
    delete: (eventId, userId) => lilDelete("/bookings/removeUserFromGame", { eventId, userId }),
    setGm: (eventId, userId, isGm = true) => lilPost("/bookings/setGmStatusForPlayerInGame", { eventId, userId, isGm })
  }
};
function metadataArrayToObject(arr) {
  const object = arr.reduce(function(result, item) {
    result[item.metaKey] = item.metaValue;
    return result;
  }, {});
  return object;
}
function getRoles(user) {
  const capabilities = user.metadata.find((md) => /capabilities/.test(md.metaKey)).metaValue;
  const roles = [...capabilities.matchAll(/"([a-z-]+)/g)].map((match) => match[1]);
  return roles;
}
function eventSort(events2) {
  return events2.sort((a, b) => new Date(a.start) - new Date(b.start) || a.name.localeCompare(b.name));
}
function simpleEvent(event, slim = false) {
  const start = event.eventStartDate + "T" + event.eventStartTime + "-07:00";
  const end = event.eventEndDate + "T" + event.eventEndTime + "-07:00";
  const categories = event.categories.map((val) => val.name).sort((a, b) => a.localeCompare(b));
  let metadata = metadataArrayToObject(event.metadata);
  metadata = {
    ...metadata,
    GM: metadata.GM && decodeText(metadata.GM),
    System: metadata.System && decodeText(metadata.System)
  };
  event = {
    id: event.eventId,
    name: event.eventName,
    slug: event.eventSlug,
    status: event.eventStatus,
    start,
    end,
    dur: Number(metadata.Length),
    categories,
    metadata,
    description: decodeText(event.postContent)
  };
  if (slim) {
    delete event.description;
    delete event.metadata;
  }
  return event;
}
function simpleEvents(events2, slim = false) {
  events2 = Array.isArray(events2) && events2.map((event) => {
    return simpleEvent(event, slim);
  });
  return eventSort(events2);
}
function bookedEvents(events2, bookings2) {
  bookings2 = bookings2.map((id) => events2.find((event) => event.eventId === id || event.id === id)).filter((event) => event).sort((a, b) => {
    let aDate = a.start || a.eventStartDate + "T" + a.eventStartTime + "-07:00";
    let bDate = b.start || b.eventStartDate + "T" + b.eventStartTime + "-07:00";
    aDate = new Date(aDate);
    bDate = new Date(bDate);
    return aDate - bDate;
  });
  return bookings2;
}
function simpleUser(user) {
  let metadata = user.metadata.filter((md) => !/capabilities/.test(md.metaKey));
  user = {
    id: user.id,
    email: user.userEmail,
    nicename: user.userNicename,
    metadata: metadataArrayToObject(metadata),
    roles: getRoles(user),
    displayName: decodeText(user.displayName) || user.displayName
  };
  return user;
}
function simpleUsersAll(users) {
  users = Array.isArray(users) && users.map((user) => simpleUser(user));
  return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
function simpleUsersAttending(users) {
  let simpleUsers = simpleUsersAll(users);
  const badgeRoles = ["gm", "paidattendee", "volunteer", "comp", "staff"];
  return simpleUsers.filter((user) => badgeRoles.some((role) => user.roles.includes(role)));
}
export {
  admin,
  bookedEvents,
  bookings,
  decodeText,
  destroy,
  events,
  favorites,
  fetcher,
  init,
  isAdmin,
  lilDelete,
  lilFetch,
  lilGet,
  lilPost,
  lilPut,
  lilRedSettings,
  login,
  logout,
  me,
  password,
  simpleEvent,
  simpleEvents,
  simpleUser,
  simpleUsersAll,
  simpleUsersAttending,
  status
};
/*! https://mths.be/utf8js v3.0.0 by @mathias */
/*! https://mths.be/windows-1252 v1.1.0 by @mathias | MIT license */
