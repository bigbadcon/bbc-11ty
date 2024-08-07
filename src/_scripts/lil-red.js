function U(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var R = {};
/*! https://mths.be/utf8js v3.0.0 by @mathias */
(function(e) {
  (function(t) {
    var r = String.fromCharCode;
    function n(s) {
      for (var i = [], g = 0, h = s.length, l, E; g < h; )
        l = s.charCodeAt(g++), l >= 55296 && l <= 56319 && g < h ? (E = s.charCodeAt(g++), (E & 64512) == 56320 ? i.push(((l & 1023) << 10) + (E & 1023) + 65536) : (i.push(l), g--)) : i.push(l);
      return i;
    }
    function o(s) {
      for (var i = s.length, g = -1, h, l = ""; ++g < i; )
        h = s[g], h > 65535 && (h -= 65536, l += r(h >>> 10 & 1023 | 55296), h = 56320 | h & 1023), l += r(h);
      return l;
    }
    function a(s) {
      if (s >= 55296 && s <= 57343)
        throw Error(
          "Lone surrogate U+" + s.toString(16).toUpperCase() + " is not a scalar value"
        );
    }
    function d(s, i) {
      return r(s >> i & 63 | 128);
    }
    function p(s) {
      if (!(s & 4294967168))
        return r(s);
      var i = "";
      return s & 4294965248 ? s & 4294901760 ? s & 4292870144 || (i = r(s >> 18 & 7 | 240), i += d(s, 12), i += d(s, 6)) : (a(s), i = r(s >> 12 & 15 | 224), i += d(s, 6)) : i = r(s >> 6 & 31 | 192), i += r(s & 63 | 128), i;
    }
    function f(s) {
      for (var i = n(s), g = i.length, h = -1, l, E = ""; ++h < g; )
        l = i[h], E += p(l);
      return E;
    }
    function c() {
      if (m >= b)
        throw Error("Invalid byte index");
      var s = w[m] & 255;
      if (m++, (s & 192) == 128)
        return s & 63;
      throw Error("Invalid continuation byte");
    }
    function F() {
      var s, i, g, h, l;
      if (m > b)
        throw Error("Invalid byte index");
      if (m == b)
        return !1;
      if (s = w[m] & 255, m++, !(s & 128))
        return s;
      if ((s & 224) == 192) {
        if (i = c(), l = (s & 31) << 6 | i, l >= 128)
          return l;
        throw Error("Invalid continuation byte");
      }
      if ((s & 240) == 224) {
        if (i = c(), g = c(), l = (s & 15) << 12 | i << 6 | g, l >= 2048)
          return a(l), l;
        throw Error("Invalid continuation byte");
      }
      if ((s & 248) == 240 && (i = c(), g = c(), h = c(), l = (s & 7) << 18 | i << 12 | g << 6 | h, l >= 65536 && l <= 1114111))
        return l;
      throw Error("Invalid UTF-8 detected");
    }
    var w, b, m;
    function C(s) {
      w = n(s), b = w.length, m = 0;
      for (var i = [], g; (g = F()) !== !1; )
        i.push(g);
      return o(i);
    }
    t.version = "3.0.0", t.encode = f, t.decode = C;
  })(e);
})(R);
const M = /* @__PURE__ */ U(R);
var O = { exports: {} };
/*! https://mths.be/windows-1252 v1.1.0 by @mathias | MIT license */
(function() {
  const e = String.fromCharCode, t = /* @__PURE__ */ new Map([[129, 1], [141, 13], [143, 15], [144, 16], [157, 29], [160, 32], [161, 33], [162, 34], [163, 35], [164, 36], [165, 37], [166, 38], [167, 39], [168, 40], [169, 41], [170, 42], [171, 43], [172, 44], [173, 45], [174, 46], [175, 47], [176, 48], [177, 49], [178, 50], [179, 51], [180, 52], [181, 53], [182, 54], [183, 55], [184, 56], [185, 57], [186, 58], [187, 59], [188, 60], [189, 61], [190, 62], [191, 63], [192, 64], [193, 65], [194, 66], [195, 67], [196, 68], [197, 69], [198, 70], [199, 71], [200, 72], [201, 73], [202, 74], [203, 75], [204, 76], [205, 77], [206, 78], [207, 79], [208, 80], [209, 81], [210, 82], [211, 83], [212, 84], [213, 85], [214, 86], [215, 87], [216, 88], [217, 89], [218, 90], [219, 91], [220, 92], [221, 93], [222, 94], [223, 95], [224, 96], [225, 97], [226, 98], [227, 99], [228, 100], [229, 101], [230, 102], [231, 103], [232, 104], [233, 105], [234, 106], [235, 107], [236, 108], [237, 109], [238, 110], [239, 111], [240, 112], [241, 113], [242, 114], [243, 115], [244, 116], [245, 117], [246, 118], [247, 119], [248, 120], [249, 121], [250, 122], [251, 123], [252, 124], [253, 125], [254, 126], [255, 127], [338, 12], [339, 28], [352, 10], [353, 26], [376, 31], [381, 14], [382, 30], [402, 3], [710, 8], [732, 24], [8211, 22], [8212, 23], [8216, 17], [8217, 18], [8218, 2], [8220, 19], [8221, 20], [8222, 4], [8224, 6], [8225, 7], [8226, 21], [8230, 5], [8240, 9], [8249, 11], [8250, 27], [8364, 0], [8482, 25]]), r = /* @__PURE__ */ new Map([[0, "€"], [1, ""], [2, "‚"], [3, "ƒ"], [4, "„"], [5, "…"], [6, "†"], [7, "‡"], [8, "ˆ"], [9, "‰"], [10, "Š"], [11, "‹"], [12, "Œ"], [13, ""], [14, "Ž"], [15, ""], [16, ""], [17, "‘"], [18, "’"], [19, "“"], [20, "”"], [21, "•"], [22, "–"], [23, "—"], [24, "˜"], [25, "™"], [26, "š"], [27, "›"], [28, "œ"], [29, ""], [30, "ž"], [31, "Ÿ"], [32, " "], [33, "¡"], [34, "¢"], [35, "£"], [36, "¤"], [37, "¥"], [38, "¦"], [39, "§"], [40, "¨"], [41, "©"], [42, "ª"], [43, "«"], [44, "¬"], [45, "­"], [46, "®"], [47, "¯"], [48, "°"], [49, "±"], [50, "²"], [51, "³"], [52, "´"], [53, "µ"], [54, "¶"], [55, "·"], [56, "¸"], [57, "¹"], [58, "º"], [59, "»"], [60, "¼"], [61, "½"], [62, "¾"], [63, "¿"], [64, "À"], [65, "Á"], [66, "Â"], [67, "Ã"], [68, "Ä"], [69, "Å"], [70, "Æ"], [71, "Ç"], [72, "È"], [73, "É"], [74, "Ê"], [75, "Ë"], [76, "Ì"], [77, "Í"], [78, "Î"], [79, "Ï"], [80, "Ð"], [81, "Ñ"], [82, "Ò"], [83, "Ó"], [84, "Ô"], [85, "Õ"], [86, "Ö"], [87, "×"], [88, "Ø"], [89, "Ù"], [90, "Ú"], [91, "Û"], [92, "Ü"], [93, "Ý"], [94, "Þ"], [95, "ß"], [96, "à"], [97, "á"], [98, "â"], [99, "ã"], [100, "ä"], [101, "å"], [102, "æ"], [103, "ç"], [104, "è"], [105, "é"], [106, "ê"], [107, "ë"], [108, "ì"], [109, "í"], [110, "î"], [111, "ï"], [112, "ð"], [113, "ñ"], [114, "ò"], [115, "ó"], [116, "ô"], [117, "õ"], [118, "ö"], [119, "÷"], [120, "ø"], [121, "ù"], [122, "ú"], [123, "û"], [124, "ü"], [125, "ý"], [126, "þ"], [127, "ÿ"]]), n = (p, f) => {
    if (f == "replacement")
      return "�";
    if (p !== null && f === "html")
      return "&#" + p + ";";
    throw new Error();
  }, d = {
    encode: (p, f) => {
      let c;
      f && f.mode && (c = f.mode.toLowerCase()), c !== "fatal" && c !== "html" && (c = "fatal");
      const F = [];
      for (let b = 0; b < p.length; b++) {
        const m = p.charCodeAt(b);
        if (m >= 0 && m <= 127) {
          F.push(e(m));
          continue;
        }
        if (t.has(m)) {
          const C = t.get(m);
          F.push(e(C + 128));
        } else
          F.push(n(m, c));
      }
      return F.join("");
    },
    decode: (p, f) => {
      let c;
      f && f.mode && (c = f.mode.toLowerCase()), c !== "replacement" && c !== "fatal" && (c = "replacement");
      const F = [];
      for (let b = 0; b < p.length; b++) {
        const m = p.charCodeAt(b);
        if (m >= 0 && m <= 127) {
          F.push(e(m));
          continue;
        }
        const C = m - 128;
        r.has(C) ? F.push(r.get(C)) : F.push(n(null, c));
      }
      return F.join("");
    },
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
  O.exports = d;
})();
var P = O.exports;
const _ = /* @__PURE__ */ U(P), T = {
  lilRedApiUrl: "",
  statusResponse: "roll plus login",
  logoutIfStale: !0,
  daysTillLogout: 10,
  serverApiKey: "",
  verbose: !1,
  fetch: void 0
};
let x = T, A = {
  token: "",
  lastLogin: ""
};
const I = "lilRedAuthToken", k = "lilRedLastLogin", S = typeof window < "u" && typeof window.document < "u";
function y(e, t, r = void 0, n = !0) {
  e === "lil-red-error" ? console.error(e, t, r) : console.log(e, t, r), S && document.dispatchEvent(
    new CustomEvent(e, {
      bubbles: n,
      detail: t
    })
  );
}
function D(e) {
  try {
    return e = _.encode(e, {
      mode: "html"
    }), M.decode(e);
  } catch {
    return e;
  }
}
async function j(e, t) {
  const r = e.replace(x.lilRedApiUrl, ""), n = x.fetch || fetch;
  try {
    const o = await n(e, t);
    if (x.verbose && console.log(`RESPONSE:lilFetch for ${r}`, o), o.status === 401)
      return y("lil-red-error", "(FETCH) Unauthorized or AuthToken invalid. Try logging out and back in."), null;
    if (!o || o.status !== 200)
      throw new Error(`fetch fail status: ${o.status}`);
    const a = await z(o);
    return x.verbose && console.log(`RESULT: lilFetch for ${r}`, a), a;
  } catch (o) {
    return r !== "/" && y("lil-red-error", `(FETCH) lilFetch failed for ${r}`, o), null;
  }
}
async function z(e) {
  const t = await e.text();
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
async function K(e, t) {
  if (!x.lilRedApiUrl)
    return null;
  const r = x.lilRedApiUrl + "/login", n = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify({
      username: e,
      password: t
    })
  };
  try {
    const o = await fetch(r, n);
    if (o.status === 401)
      return y(
        "lil-red-error",
        "(LOGIN) Unauthorized. Either username or password is incorrect.",
        o.status.toString()
      ), null;
    if (o.status === 200 && o.headers.get("authorization")) {
      const a = o.headers.get("authorization") || "", d = (/* @__PURE__ */ new Date()).toISOString();
      return A = {
        token: a,
        lastLogin: d
      }, S && (localStorage.setItem(I, a), localStorage.setItem(k, d)), y("lil-red-login", "success", e), a;
    }
    if (o.status !== 200)
      throw new Error(`fetch fail status: ${o.status}`);
  } catch (o) {
    return y("lil-red-error", "(LOGIN) Login failed", o), null;
  }
}
async function N(e = { api: "/", method: "GET" }) {
  if (!x.lilRedApiUrl || !e.api)
    return null;
  const t = x.lilRedApiUrl + e.api, r = {
    method: e.method,
    headers: {}
  };
  e.body && (e.body instanceof FormData ? r.body = e.body : (r.body = JSON.stringify(e.body), r.headers["Content-Type"] = "application/json;charset=utf-8"));
  const n = e.publicMethod || e.api === "/" || /public/.test(e.api);
  console.log("publicMethod", n);
  const o = e.serverApiKey || x.serverApiKey;
  if (!n && !o) {
    const d = S && localStorage.getItem(I) || "", p = e.token || A.token || d;
    if (p)
      r.headers.Authorization = p;
    else
      return y(
        "lil-red-error",
        "(FETCH) AuthToken missing, you will be logged out. Please log back in and try again.",
        e.api
      ), B(), null;
    if (x.logoutIfStale) {
      A.lastLogin = (A.lastLogin || S) && localStorage.getItem(k) || "";
      const f = Date.parse(A.lastLogin), c = /* @__PURE__ */ new Date(), F = x.daysTillLogout || 10, w = Date.parse(
        new Date(c.setDate(c.getDate() - F)).toISOString()
      );
      if (isNaN(f) || isNaN(w) || f < w)
        return y(
          "lil-red-error",
          `(FETCH) Auth token stale. Last Login: ${f}. You will be logged out. Please log back in.`,
          e.api
        ), B(), null;
    }
  }
  return !n && o && (r.headers["x-api-key"] = o), await j(t, r);
}
const u = (e, t) => N({ api: e, method: "GET", ...t }), v = (e, t, r) => N({
  api: e,
  method: "POST",
  body: t,
  ...r
}), G = (e, t, r) => N({
  api: e,
  method: "PUT",
  body: t,
  ...r
}), L = (e, t, r) => N({
  api: e,
  method: "DELETE",
  body: t,
  ...r
});
async function W(e) {
  return q(), x = { ...T, ...e }, console.log("🐺 Initializing LilRed", x), y("lil-red-init", "Initializing Lil Red", x), e.lilRedApiUrl;
}
function q() {
  const e = x.lilRedApiUrl;
  return x = T, e && y("lil-red-destroy", "Deinitialized", e), !0;
}
const Z = async (e = 1, t = 5e3, r = 1) => {
  if (S && !navigator.onLine)
    return y("lil-red-error", "You are not currently online", navigator.onLine), !1;
  const n = x.statusResponse;
  let o;
  for (let a = 0; a < e; a++)
    a > 0 && (await new Promise((d) => setTimeout(d, t)), t = r * t), o = await u("/"), y("lil-red-status", (o === n).toString(), `check: ${a + 1}`), o === n && (a = e);
  return o !== n && y("lil-red-error", "(STATUS) Little Red Event Manager not available", x == null ? void 0 : x.lilRedApiUrl), o;
}, ee = (e, t) => K(e, t), B = () => {
  y("lil-red-logout", "You have been logged out of Lil Red", /* @__PURE__ */ new Date()), A = {
    token: "",
    lastLogin: ""
  }, S && (localStorage.removeItem(I), localStorage.removeItem(k));
}, te = () => u("/users/me/isadmin"), re = () => u("/users/me"), oe = {
  slots: () => u("/bookings/myAvailableSlots"),
  get: () => u("/events/me"),
  add: (e) => v("/bookings/bookMeIntoGame", { gameId: Number(e) }),
  delete: (e) => L("/bookings/removeMeFromGame", {
    gameId: Number(e)
  }),
  addAsAddtlGM: (e, t) => v("/bookings/addPlayerAsAddtlGmToGame", { eventId: Number(e), additionalGmGuid: t })
}, ne = {
  get: () => u("/events/me/favorites"),
  add: (e) => v("/events/me/favorite/create", {
    eventId: Number(e)
  }),
  delete: (e) => L("/events/me/favorite/delete", {
    eventId: Number(e)
  })
}, se = {
  // TODO: sort all this out and make sure it works
  set: (e, t) => v("/users/setMyPassword", {
    userId: Number(e),
    password: t
  }),
  requestReset: (e) => v("/users/resetPasswordRequest", {
    email: e
  }),
  mailRequest: (e, t, r) => v("/password/request", {
    emailAddress: e,
    emailBody: t,
    emailSubject: r
  }),
  reset: (e, t, r) => v("/password/reset", {
    emailAddress: e,
    password: t,
    uuid: r
  }),
  confirm: (e, t) => v("/users/confirmPasswordRequest", {
    password: e,
    token: t
  })
}, ae = {
  me: () => u("/events/me"),
  // this is same as bookings.get
  find: (e) => v("/events/find", { id: Number(e) }),
  getAddtlGMCode: (e) => u(`/events/getAddtlGmCode/${e}`),
  bookings: async (e) => {
    if (isNaN(Number(e)) || (e = await v("/events/find", { id: Number(e) })), typeof e == "object" && e.bookings) {
      const t = e.bookings.filter((o) => o.bookingStatus === 1).map((o) => ({
        id: o.user.id,
        displayName: D(o.user.displayName),
        bookingComment: o.bookingComment
      })), r = t.filter((o) => o.bookingComment).sort((o, a) => o.displayName.localeCompare(a.displayName)) || [], n = t.filter((o) => !o.bookingComment).map((o) => ({
        id: o.id,
        displayName: D(o.displayName)
      })).sort((o, a) => o.displayName.localeCompare(a.displayName)) || [];
      return {
        hosts: r,
        attendees: n
      };
    } else
      return !1;
  },
  all: () => u("/events/all"),
  category: (e) => u(`/events/category/${e}`),
  count: () => u("/events/count"),
  create: (e) => G("/events/create", e),
  uploadImage: async (e) => N({
    api: "/events/image",
    method: "POST",
    body: e
  }),
  currentYear: (e, t) => u(`/events/page/${e}/${t}`),
  since: (e) => u(`/events/since/${e}`),
  public: {
    all: () => u("/events/all/public"),
    currentYear: (e, t) => u(`/events/page/public/${e}/${t}`),
    spaces: () => u("/events/spaces/public"),
    space: (e) => u(`/events/${e}/spaces/public`),
    image: (e) => u(`/events/image/${e}`, { publicMethod: !0 }),
    categories: async (e) => {
      if (e = e || await u("/events/all/public"), e) {
        const t = e.reduce((n, o) => {
          const a = o.categories.map((d) => d.name) || [];
          return [...n, ...a];
        }, []);
        return [...new Set(t)];
      } else
        return !1;
    }
  }
  // TODO: add priorYear? "events-for-year-controller" which isn't as useful
}, ie = {
  roles: {
    add: (e, t) => v("/users/addRoleToUser", {
      userId: Number(e),
      role: t
    }),
    delete: (e, t) => v("/users/removeRoleFromUser", {
      userId: Number(e),
      role: t
    })
  },
  users: {
    all: () => u("/users/all"),
    create: (e) => G("/users/create", e),
    findById: (e) => u(`/users/id/${e}`),
    findByEmail: (e) => u(`/users/email/${e}`),
    setPassword: (e, t) => v("/users/setPassword", { password: t, userId: e })
  },
  bookings: {
    get: (e) => v("/events/user", { id: e }),
    add: (e, t, r = !1) => v("/bookings/addUserToGame", { eventId: e, userId: t, isGm: r }),
    delete: (e, t) => L("/bookings/removeUserFromGame", { eventId: e, userId: t }),
    // TODO: check if isGm is required
    setGm: (e, t, r = !0) => v("/bookings/setGmStatusForPlayerInGame", { eventId: e, userId: t, isGm: r })
  }
};
function $(e) {
  return e.reduce(function(r, n) {
    return r[n.metaKey] = n.metaValue, r;
  }, {});
}
function Y(e) {
  var r;
  const t = (r = e.metadata.find((n) => /capabilities/.test(n.metaKey))) == null ? void 0 : r.metaValue;
  if (t)
    return [...t.matchAll(/"([a-z-]+)/g)].map((n) => n[1]);
}
function H(e) {
  return e.sort(
    (t, r) => new Date(t.start).valueOf() - new Date(r.start).valueOf() || t.name.localeCompare(r.name)
  );
}
const J = (e, t) => {
  const r = +new Date(e), n = +new Date(t);
  return Math.abs(n - r) / 1e3 / 3600 % 24;
};
function V(e, t = !1) {
  const r = e.eventStartDate + "T" + e.eventStartTime + "-07:00", n = e.eventEndDate + "T" + e.eventEndTime + "-07:00", o = e.categories.map((p) => p.name).sort((p, f) => p.localeCompare(f));
  let a = $(e.metadata);
  a = {
    ...a,
    GM: a.GM && D(a.GM),
    System: a.System && D(a.System)
  };
  const d = {
    id: e.eventId,
    name: e.eventName,
    slug: e.eventSlug,
    status: e.eventStatus,
    start: r,
    end: n,
    dur: parseInt(a.Length) || J(r, n),
    categories: o,
    metadata: a,
    description: D(e.postContent)
  };
  return t && (delete d.description, delete d.metadata), d;
}
function le(e, t = !1) {
  const r = e.map((n) => V(n, t));
  return H(r);
}
function ue(e, t) {
  if (t.length === 0)
    return t;
  const r = [];
  return t.forEach((n) => {
    const o = e.find((a) => a.eventId === n);
    o && r.push(o);
  }), r.length === 0 ? r : r.sort((n, o) => {
    const a = n.eventStartDate + "T" + n.eventStartTime + "-07:00", d = o.eventStartDate + "T" + o.eventStartTime + "-07:00", p = new Date(a).valueOf(), f = new Date(d).valueOf();
    return p - f;
  });
}
function X(e) {
  const t = e.metadata.filter((n) => !/capabilities/.test(n.metaKey));
  return {
    id: e.id,
    email: e.userEmail,
    nicename: e.userNicename,
    metadata: $(t),
    roles: Y(e),
    displayName: D(e.displayName)
  };
}
function Q(e) {
  return e.map((r) => X(r)).sort((r, n) => r.displayName.localeCompare(n.displayName));
}
function ce(e) {
  const t = Q(e), r = ["gm", "paidattendee", "volunteer", "comp", "staff"];
  return t.filter((n) => r.some((o) => {
    var a;
    return (a = n.roles) == null ? void 0 : a.includes(o);
  }));
}
export {
  ie as admin,
  ue as bookedEvents,
  oe as bookings,
  D as decodeText,
  q as destroy,
  ae as events,
  ne as favorites,
  j as fetcher,
  W as init,
  te as isAdmin,
  L as lilDelete,
  N as lilFetch,
  u as lilGet,
  v as lilPost,
  G as lilPut,
  x as lilRedSettings,
  ee as login,
  B as logout,
  re as me,
  se as password,
  V as simpleEvent,
  le as simpleEvents,
  X as simpleUser,
  Q as simpleUsersAll,
  ce as simpleUsersAttending,
  Z as status
};
//# sourceMappingURL=lil-red.js.map
