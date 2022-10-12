function A() {}
function Y(e) {
	return e();
}
function et() {
	return Object.create(null);
}
function M(e) {
	e.forEach(Y);
}
function K(e) {
	return typeof e == "function";
}
function at(e, t) {
	return e != e
		? t == t
		: e !== t || (e && typeof e == "object") || typeof e == "function";
}
let F;
function $t(e, t) {
	return F || (F = document.createElement("a")), (F.href = t), e === F.href;
}
function lt(e) {
	return Object.keys(e).length === 0;
}
function d(e, t) {
	e.appendChild(t);
}
function z(e, t, i) {
	e.insertBefore(t, i || null);
}
function L(e) {
	e.parentNode.removeChild(e);
}
function m(e) {
	return document.createElement(e);
}
function R(e) {
	return document.createTextNode(e);
}
function j() {
	return R(" ");
}
function Ct() {
	return R("");
}
function x(e, t, i, n) {
	return e.addEventListener(t, i, n), () => e.removeEventListener(t, i, n);
}
function jt(e) {
	return function (t) {
		return t.preventDefault(), e.call(this, t);
	};
}
function At(e) {
	return function (t) {
		return t.stopPropagation(), e.call(this, t);
	};
}
function c(e, t, i) {
	i == null
		? e.removeAttribute(t)
		: e.getAttribute(t) !== i && e.setAttribute(t, i);
}
function ot(e) {
	return Array.from(e.childNodes);
}
function Z(e, t) {
	(t = "" + t), e.wholeText !== t && (e.data = t);
}
function k(e, t, i, n) {
	i === null
		? e.style.removeProperty(t)
		: e.style.setProperty(t, i, n ? "important" : "");
}
function Mt(e, t, i) {
	e.classList[i ? "add" : "remove"](t);
}
function st(e) {
	const t = {};
	for (const i of e) t[i.name] = i.value;
	return t;
}
let I;
function X(e) {
	I = e;
}
function ct() {
	if (!I) throw new Error("Function called outside component initialization");
	return I;
}
function zt(e) {
	ct().$$.on_mount.push(e);
}
function Lt(e, t) {
	const i = e.$$.callbacks[t.type];
	i && i.slice().forEach((n) => n.call(this, t));
}
const N = [],
	it = [],
	G = [],
	nt = [],
	ut = Promise.resolve();
let Q = !1;
function ht() {
	Q || ((Q = !0), ut.then(b));
}
function U(e) {
	G.push(e);
}
const J = new Set();
let V = 0;
function b() {
	const e = I;
	do {
		for (; V < N.length; ) {
			const t = N[V];
			V++, X(t), dt(t.$$);
		}
		for (X(null), N.length = 0, V = 0; it.length; ) it.pop()();
		for (let t = 0; t < G.length; t += 1) {
			const i = G[t];
			J.has(i) || (J.add(i), i());
		}
		G.length = 0;
	} while (N.length);
	for (; nt.length; ) nt.pop()();
	(Q = !1), J.clear(), X(e);
}
function dt(e) {
	if (e.fragment !== null) {
		e.update(), M(e.before_update);
		const t = e.dirty;
		(e.dirty = [-1]),
			e.fragment && e.fragment.p(e.ctx, t),
			e.after_update.forEach(U);
	}
}
const ft = new Set();
function mt(e, t) {
	e && e.i && (ft.delete(e), e.i(t));
}
function _t(e, t, i, n) {
	const { fragment: r, after_update: S } = e.$$;
	r && r.m(t, i),
		n ||
			U(() => {
				const p = e.$$.on_mount.map(Y).filter(K);
				e.$$.on_destroy ? e.$$.on_destroy.push(...p) : M(p),
					(e.$$.on_mount = []);
			}),
		S.forEach(U);
}
function gt(e, t) {
	const i = e.$$;
	i.fragment !== null &&
		(M(i.on_destroy),
		i.fragment && i.fragment.d(t),
		(i.on_destroy = i.fragment = null),
		(i.ctx = []));
}
function kt(e, t) {
	e.$$.dirty[0] === -1 && (N.push(e), ht(), e.$$.dirty.fill(0)),
		(e.$$.dirty[(t / 31) | 0] |= 1 << t % 31);
}
function pt(e, t, i, n, r, S, p, a = [-1]) {
	const l = I;
	X(e);
	const s = (e.$$ = {
		fragment: null,
		ctx: [],
		props: S,
		update: A,
		not_equal: r,
		bound: et(),
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(t.context || (l ? l.$$.context : [])),
		callbacks: et(),
		dirty: a,
		skip_bound: !1,
		root: t.target || l.$$.root,
	});
	p && p(s.root);
	let w = !1;
	if (
		((s.ctx = i
			? i(e, t.props || {}, (f, y, ..._) => {
					const u = _.length ? _[0] : y;
					return (
						s.ctx &&
							r(s.ctx[f], (s.ctx[f] = u)) &&
							(!s.skip_bound && s.bound[f] && s.bound[f](u),
							w && kt(e, f)),
						y
					);
			  })
			: []),
		s.update(),
		(w = !0),
		M(s.before_update),
		(s.fragment = n ? n(s.ctx) : !1),
		t.target)
	) {
		if (t.hydrate) {
			const f = ot(t.target);
			s.fragment && s.fragment.l(f), f.forEach(L);
		} else s.fragment && s.fragment.c();
		t.intro && mt(e.$$.fragment),
			_t(e, t.target, t.anchor, t.customElement),
			b();
	}
	X(l);
}
let rt;
typeof HTMLElement == "function" &&
	(rt = class extends HTMLElement {
		constructor() {
			super(), this.attachShadow({ mode: "open" });
		}
		connectedCallback() {
			const { on_mount: e } = this.$$;
			this.$$.on_disconnect = e.map(Y).filter(K);
			for (const t in this.$$.slotted)
				this.appendChild(this.$$.slotted[t]);
		}
		attributeChangedCallback(e, t, i) {
			this[e] = i;
		}
		disconnectedCallback() {
			M(this.$$.on_disconnect);
		}
		$destroy() {
			gt(this, 1), (this.$destroy = A);
		}
		$on(e, t) {
			if (!K(t)) return A;
			const i = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
			return (
				i.push(t),
				() => {
					const n = i.indexOf(t);
					n !== -1 && i.splice(n, 1);
				}
			);
		}
		$set(e) {
			this.$$set &&
				!lt(e) &&
				((this.$$.skip_bound = !0),
				this.$$set(e),
				(this.$$.skip_bound = !1));
		}
	});
function bt(e) {
	let t, i;
	return {
		c() {
			(t = m("span")), (i = R(e[2])), c(t, "part", "light");
		},
		m(n, r) {
			z(n, t, r), d(t, i);
		},
		p(n, r) {
			r & 4 && Z(i, n[2]);
		},
		d(n) {
			n && L(t);
		},
	};
}
function wt(e) {
	let t;
	return {
		c() {
			(t = m("span")),
				c(t, "part", "light"),
				c(t, "class", "icon"),
				k(t, "mask-image", e[9], !1),
				k(t, "-webkit-mask-image", e[9], !1);
		},
		m(i, n) {
			z(i, t, n);
		},
		p(i, n) {
			n & 512 && k(t, "mask-image", i[9], !1),
				n & 512 && k(t, "-webkit-mask-image", i[9], !1);
		},
		d(i) {
			i && L(t);
		},
	};
}
function yt(e) {
	let t, i;
	return {
		c() {
			(t = m("span")), (i = R(e[3])), c(t, "part", "dark");
		},
		m(n, r) {
			z(n, t, r), d(t, i);
		},
		p(n, r) {
			r & 8 && Z(i, n[3]);
		},
		d(n) {
			n && L(t);
		},
	};
}
function vt(e) {
	let t;
	return {
		c() {
			(t = m("span")),
				c(t, "part", "dark"),
				c(t, "class", "icon"),
				k(t, "mask-image", e[8], !1),
				k(t, "-webkit-mask-image", e[8], !1);
		},
		m(i, n) {
			z(i, t, n);
		},
		p(i, n) {
			n & 256 && k(t, "mask-image", i[8], !1),
				n & 256 && k(t, "-webkit-mask-image", i[8], !1);
		},
		d(i) {
			i && L(t);
		},
	};
}
function Et(e) {
	let t, i, n, r, S, p, a, l, s, w, f, y, _, u, C, O, T, $, W, q, H, o;
	function P(h, g) {
		return h[4] ? wt : bt;
	}
	let B = P(e),
		v = B(e);
	function tt(h, g) {
		return h[5] ? vt : yt;
	}
	let D = tt(e),
		E = D(e);
	return {
		c() {
			(t = m("div")),
				(i = m("div")),
				(n = m("label")),
				(r = m("input")),
				(S = j()),
				v.c(),
				(p = j()),
				(a = m("label")),
				(l = m("input")),
				(s = j()),
				(w = m("span")),
				(f = R(e[1])),
				(y = j()),
				(_ = m("label")),
				(u = m("input")),
				(C = j()),
				E.c(),
				(O = j()),
				(T = m("div")),
				($ = m("div")),
				(W = j()),
				(q = m("div")),
				(this.c = A),
				(r.__value = "light"),
				(r.value = r.__value),
				c(r, "type", "radio"),
				e[14][0].push(r),
				c(n, "class", "light"),
				(l.__value = "auto"),
				(l.value = l.__value),
				c(l, "type", "radio"),
				(l.checked = !0),
				e[14][0].push(l),
				c(w, "part", "auto"),
				c(a, "class", "auto"),
				k(a, "width", e[6], !1),
				(u.__value = "dark"),
				(u.value = u.__value),
				c(u, "type", "radio"),
				e[14][0].push(u),
				c(_, "class", "dark"),
				c(i, "class", "switch-inner"),
				c($, "class", "knob-track"),
				c($, "part", "track"),
				k($, "width", e[7], !1),
				c(q, "class", "knob"),
				c(T, "class", "knob-wrapper"),
				c(T, "part", "knob"),
				c(t, "class", "switch-wrapper"),
				c(t, "data-theme", e[0]);
		},
		m(h, g) {
			z(h, t, g),
				d(t, i),
				d(i, n),
				d(n, r),
				(r.checked = r.__value === e[0]),
				d(n, S),
				v.m(n, null),
				d(i, p),
				d(i, a),
				d(a, l),
				(l.checked = l.__value === e[0]),
				d(a, s),
				d(a, w),
				d(w, f),
				d(i, y),
				d(i, _),
				d(_, u),
				(u.checked = u.__value === e[0]),
				d(_, C),
				E.m(_, null),
				d(t, O),
				d(t, T),
				d(T, $),
				d(T, W),
				d(T, q),
				H ||
					((o = [
						x(r, "change", e[13]),
						x(l, "change", e[15]),
						x(u, "change", e[16]),
						x(t, "click", e[10]),
						x(t, "keydown", e[10]),
					]),
					(H = !0));
		},
		p(h, [g]) {
			g & 1 && (r.checked = r.__value === h[0]),
				B === (B = P(h)) && v
					? v.p(h, g)
					: (v.d(1), (v = B(h)), v && (v.c(), v.m(n, null))),
				g & 1 && (l.checked = l.__value === h[0]),
				g & 2 && Z(f, h[1]),
				g & 64 && k(a, "width", h[6], !1),
				g & 1 && (u.checked = u.__value === h[0]),
				D === (D = tt(h)) && E
					? E.p(h, g)
					: (E.d(1), (E = D(h)), E && (E.c(), E.m(_, null))),
				g & 128 && k($, "width", h[7], !1),
				g & 1 && c(t, "data-theme", h[0]);
		},
		i: A,
		o: A,
		d(h) {
			h && L(t),
				e[14][0].splice(e[14][0].indexOf(r), 1),
				v.d(),
				e[14][0].splice(e[14][0].indexOf(l), 1),
				e[14][0].splice(e[14][0].indexOf(u), 1),
				E.d(),
				(H = !1),
				M(o);
		},
	};
}
function St(e, t, i) {
	let n,
		r,
		S,
		p,
		{ theme: a = "auto" } = t,
		{ auto: l = "" } = t,
		{ light: s = "light" } = t,
		{ dark: w = "dark" } = t,
		{ dark_theme: f = "" } = t,
		{ light_theme: y = "" } = t,
		{ light_icon: _ = "" } = t,
		{ dark_icon: u = "" } = t;
	const C = window.localStorage.getItem("theme");
	C &&
		(console.log(
			"\u{1F680} ~ file: ThemeSwitch.svelte ~ line 10 ~ savedTheme",
			C
		),
		(a = C),
		O(C));
	function O(o) {
		i(0, (a = o)),
			document.querySelector("html").setAttribute("data-theme", a);
		const P = document.querySelector("meta[name='theme-color']");
		P && f && y && P.setAttribute("content", a === "dark" ? f : y),
			window.localStorage.setItem("theme", a);
	}
	function T(o) {
		o.target.checked && O(o.target.value);
	}
	const $ = [[]];
	function W() {
		(a = this.__value), i(0, a);
	}
	function q() {
		(a = this.__value), i(0, a);
	}
	function H() {
		(a = this.__value), i(0, a);
	}
	return (
		(e.$$set = (o) => {
			"theme" in o && i(0, (a = o.theme)),
				"auto" in o && i(1, (l = o.auto)),
				"light" in o && i(2, (s = o.light)),
				"dark" in o && i(3, (w = o.dark)),
				"dark_theme" in o && i(11, (f = o.dark_theme)),
				"light_theme" in o && i(12, (y = o.light_theme)),
				"light_icon" in o && i(4, (_ = o.light_icon)),
				"dark_icon" in o && i(5, (u = o.dark_icon));
		}),
		(e.$$.update = () => {
			e.$$.dirty & 16 && i(9, (n = _ && `url(${_})`)),
				e.$$.dirty & 32 && i(8, (r = u && `url(${u})`)),
				e.$$.dirty & 2 && i(7, (S = l ? "2.5rem" : "1.75rem")),
				e.$$.dirty & 2 && i(6, (p = l ? "1.5rem" : ".75rem"));
		}),
		[a, l, s, w, _, u, p, S, r, n, T, f, y, W, $, q, H]
	);
}
class Tt extends rt {
	constructor(t) {
		super(),
			(this.shadowRoot.innerHTML =
				'<style>.switch-wrapper{position:relative;display:inline-grid;grid-template:"switch";place-items:center;place-content:center}.switch-wrapper>*{grid-area:switch}.switch-inner{display:flex;position:relative;z-index:10;align-items:center;height:1rem}.light{display:flex;position:relative;justify-content:flex-end;align-items:center;width:1.5rem;height:1.5rem;padding-right:0.75rem}.auto{position:relative;width:1.5rem;height:1.5rem}.dark{display:flex;position:relative;align-items:center;width:1.5rem;height:1.5rem;padding-left:0.75rem}input{display:block;position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;cursor:pointer;opacity:0}[part]{cursor:pointer;font-size:0.8rem;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;font-weight:700}[part="auto"]{display:block;position:absolute;width:200%;top:-0.9rem;left:50%;transform:translate(-50%, 0%);text-align:center}.knob{left:50%;transform:translateX(-50%);position:absolute;top:0;background-color:var(--lil-red-switch-knob, #888);transition-property:all;transition-duration:300ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);width:1rem;height:1rem;border-radius:var(--lil-red-switch-border-radius, 0px);border:var(--lil-red-switch-knob-border, none);box-sizing:border-box}.knob-track{background-color:var(--lil-red-switch-track, transparent);height:1rem;border-radius:var(--lil-red-switch-border-radius, 0px);border:var(--lil-red-switch-track-border, none);box-shadow:var(--lil-red-switch-track-shadow, none);box-sizing:border-box}.knob-wrapper{position:relative}[data-theme="light"] .knob{left:0;transform:translateX(0%)}[data-theme="dark"] .knob{left:100%;transform:translateX(-100%)}[data-theme]{color:var(--lil-red-switch-color, inherit)}[data-theme="auto"] .auto,[data-theme="light"] .light,[data-theme="dark"] .dark{color:var(--lil-red-switch-highlight, inherit)}.icon{-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;width:1rem;height:1rem;background-color:var(--lil-red-switch-color, #555)}.light .icon{-webkit-mask-position:right;mask-position:right}[data-theme="dark"] .dark .icon,[data-theme="light"] .light .icon{background-color:var(--lil-red-switch-highlight, inherit)}</style>'),
			pt(
				this,
				{
					target: this.shadowRoot,
					props: st(this.attributes),
					customElement: !0,
				},
				St,
				Et,
				at,
				{
					theme: 0,
					auto: 1,
					light: 2,
					dark: 3,
					dark_theme: 11,
					light_theme: 12,
					light_icon: 4,
					dark_icon: 5,
				},
				null
			),
			t &&
				(t.target && z(t.target, this, t.anchor),
				t.props && (this.$set(t.props), b()));
	}
	static get observedAttributes() {
		return [
			"theme",
			"auto",
			"light",
			"dark",
			"dark_theme",
			"light_theme",
			"light_icon",
			"dark_icon",
		];
	}
	get theme() {
		return this.$$.ctx[0];
	}
	set theme(t) {
		this.$$set({ theme: t }), b();
	}
	get auto() {
		return this.$$.ctx[1];
	}
	set auto(t) {
		this.$$set({ auto: t }), b();
	}
	get light() {
		return this.$$.ctx[2];
	}
	set light(t) {
		this.$$set({ light: t }), b();
	}
	get dark() {
		return this.$$.ctx[3];
	}
	set dark(t) {
		this.$$set({ dark: t }), b();
	}
	get dark_theme() {
		return this.$$.ctx[11];
	}
	set dark_theme(t) {
		this.$$set({ dark_theme: t }), b();
	}
	get light_theme() {
		return this.$$.ctx[12];
	}
	set light_theme(t) {
		this.$$set({ light_theme: t }), b();
	}
	get light_icon() {
		return this.$$.ctx[4];
	}
	set light_icon(t) {
		this.$$set({ light_icon: t }), b();
	}
	get dark_icon() {
		return this.$$.ctx[5];
	}
	set dark_icon(t) {
		this.$$set({ dark_icon: t }), b();
	}
}
customElements.define("lil-red-theme-switch", Tt);
export {
	rt as S,
	st as a,
	z as b,
	j as c,
	$t as d,
	m as e,
	b as f,
	c as g,
	Mt as h,
	pt as i,
	d as j,
	Z as k,
	L as l,
	it as m,
	A as n,
	zt as o,
	Ct as p,
	x as q,
	M as r,
	at as s,
	R as t,
	jt as u,
	At as v,
	Lt as w,
};
