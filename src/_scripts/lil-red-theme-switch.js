function C(){}function J(e){return e()}function Q(){return Object.create(null)}function A(e){e.forEach(J)}function V(e){return typeof e=="function"}function Y(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}function Z(e){return Object.keys(e).length===0}function f(e,t){e.appendChild(t)}function L(e,t,i){e.insertBefore(t,i||null)}function M(e){e.parentNode.removeChild(e)}function m(e){return document.createElement(e)}function tt(e){return document.createTextNode(e)}function x(){return tt(" ")}function $(e,t,i,r){return e.addEventListener(t,i,r),()=>e.removeEventListener(t,i,r)}function d(e,t,i){i==null?e.removeAttribute(t):e.getAttribute(t)!==i&&e.setAttribute(t,i)}function et(e){return Array.from(e.childNodes)}function u(e,t,i,r){i===null?e.style.removeProperty(t):e.style.setProperty(t,i,r?"important":"")}function it(e){const t={};for(const i of e)t[i.name]=i.value;return t}let K;function N(e){K=e}const z=[],U=[],B=[],W=[],rt=Promise.resolve();let F=!1;function lt(){F||(F=!0,rt.then(v))}function G(e){B.push(e)}const D=new Set;let R=0;function v(){const e=K;do{for(;R<z.length;){const t=z[R];R++,N(t),nt(t.$$)}for(N(null),z.length=0,R=0;U.length;)U.pop()();for(let t=0;t<B.length;t+=1){const i=B[t];D.has(i)||(D.add(i),i())}B.length=0}while(z.length);for(;W.length;)W.pop()();F=!1,D.clear(),N(e)}function nt(e){if(e.fragment!==null){e.update(),A(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(G)}}const at=new Set;function ot(e,t){e&&e.i&&(at.delete(e),e.i(t))}function ht(e,t,i,r){const{fragment:a,after_update:c}=e.$$;a&&a.m(t,i),r||G(()=>{const k=e.$$.on_mount.map(J).filter(V);e.$$.on_destroy?e.$$.on_destroy.push(...k):A(k),e.$$.on_mount=[]}),c.forEach(G)}function ct(e,t){const i=e.$$;i.fragment!==null&&(A(i.on_destroy),i.fragment&&i.fragment.d(t),i.on_destroy=i.fragment=null,i.ctx=[])}function st(e,t){e.$$.dirty[0]===-1&&(z.push(e),lt(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function dt(e,t,i,r,a,c,k,b=[-1]){const n=K;N(e);const o=e.$$={fragment:null,ctx:[],props:c,update:C,not_equal:a,bound:Q(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(n?n.$$.context:[])),callbacks:Q(),dirty:b,skip_bound:!1,root:t.target||n.$$.root};k&&k(o.root);let w=!1;if(o.ctx=i?i(e,t.props||{},(g,p,...s)=>{const y=s.length?s[0]:p;return o.ctx&&a(o.ctx[g],o.ctx[g]=y)&&(!o.skip_bound&&o.bound[g]&&o.bound[g](y),w&&st(e,g)),p}):[],o.update(),w=!0,A(o.before_update),o.fragment=r?r(o.ctx):!1,t.target){if(t.hydrate){const g=et(t.target);o.fragment&&o.fragment.l(g),g.forEach(M)}else o.fragment&&o.fragment.c();t.intro&&ot(e.$$.fragment),ht(e,t.target,t.anchor,t.customElement),v()}N(n)}let X;typeof HTMLElement=="function"&&(X=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:e}=this.$$;this.$$.on_disconnect=e.map(J).filter(V);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(e,t,i){this[e]=i}disconnectedCallback(){A(this.$$.on_disconnect)}$destroy(){ct(this,1),this.$destroy=C}$on(e,t){if(!V(t))return C;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(t),()=>{const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!Z(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}});function ut(e){let t;return{c(){t=m("span"),t.textContent="Light",d(t,"part","light")},m(i,r){L(i,t,r)},p:C,d(i){i&&M(t)}}}function ft(e){let t;return{c(){t=m("span"),d(t,"part","light"),d(t,"class","icon"),u(t,"mask-image",e[8],!1),u(t,"-webkit-mask-image",e[8],!1)},m(i,r){L(i,t,r)},p(i,r){r&256&&u(t,"mask-image",i[8],!1),r&256&&u(t,"-webkit-mask-image",i[8],!1)},d(i){i&&M(t)}}}function gt(e){let t;return{c(){t=m("span"),t.textContent="Dark",d(t,"part","dark")},m(i,r){L(i,t,r)},p:C,d(i){i&&M(t)}}}function _t(e){let t;return{c(){t=m("span"),d(t,"part","dark"),d(t,"class","icon"),u(t,"mask-image",e[7],!1),u(t,"-webkit-mask-image",e[7],!1)},m(i,r){L(i,t,r)},p(i,r){r&128&&u(t,"mask-image",i[7],!1),r&128&&u(t,"-webkit-mask-image",i[7],!1)},d(i){i&&M(t)}}}function mt(e){let t,i,r,a,c,k,b,n,o,w,g,p,s,y,j,T,O,P;function q(h,_){return h[1]?ft:ut}let S=q(e),l=S(e);function H(h,_){return h[3]?_t:gt}let I=H(e),E=I(e);return{c(){t=m("div"),i=m("div"),r=m("label"),a=m("input"),c=x(),l.c(),k=x(),b=m("label"),n=m("input"),o=x(),w=m("span"),w.textContent="Auto",g=x(),p=m("label"),s=m("input"),y=x(),E.c(),j=x(),T=m("div"),T.innerHTML=`<div class="knob-inner"></div> 
		<div class="knob"></div>`,this.c=C,a.__value="light",a.value=a.__value,d(a,"type","radio"),e[13][0].push(a),d(r,"class","light"),n.__value="auto",n.value=n.__value,d(n,"type","radio"),n.checked=!0,e[13][0].push(n),d(w,"part","auto"),d(b,"class","auto"),s.__value="dark",s.value=s.__value,d(s,"type","radio"),e[13][0].push(s),d(p,"class","dark"),d(i,"class","switch-inner"),d(T,"class","knob-wrapper"),d(t,"class","switch-wrapper"),d(t,"data-theme",e[0]),u(t,"--lil-red-switch-light-highlight",e[6],!1),u(t,"--lil-red-switch-dark-highlight",e[5],!1),u(t,"--lil-red-switch-light-color",e[2],!1),u(t,"--lil-red-switch-dark-color",e[4],!1)},m(h,_){L(h,t,_),f(t,i),f(i,r),f(r,a),a.checked=a.__value===e[0],f(r,c),l.m(r,null),f(i,k),f(i,b),f(b,n),n.checked=n.__value===e[0],f(b,o),f(b,w),f(i,g),f(i,p),f(p,s),s.checked=s.__value===e[0],f(p,y),E.m(p,null),f(t,j),f(t,T),O||(P=[$(a,"change",e[12]),$(n,"change",e[14]),$(s,"change",e[15]),$(t,"click",e[9]),$(t,"keydown",e[9])],O=!0)},p(h,[_]){_&1&&(a.checked=a.__value===h[0]),S===(S=q(h))&&l?l.p(h,_):(l.d(1),l=S(h),l&&(l.c(),l.m(r,null))),_&1&&(n.checked=n.__value===h[0]),_&1&&(s.checked=s.__value===h[0]),I===(I=H(h))&&E?E.p(h,_):(E.d(1),E=I(h),E&&(E.c(),E.m(p,null))),_&1&&d(t,"data-theme",h[0]),_&64&&u(t,"--lil-red-switch-light-highlight",h[6],!1),_&32&&u(t,"--lil-red-switch-dark-highlight",h[5],!1),_&4&&u(t,"--lil-red-switch-light-color",h[2],!1),_&16&&u(t,"--lil-red-switch-dark-color",h[4],!1)},i:C,o:C,d(h){h&&M(t),e[13][0].splice(e[13][0].indexOf(a),1),l.d(),e[13][0].splice(e[13][0].indexOf(n),1),e[13][0].splice(e[13][0].indexOf(s),1),E.d(),O=!1,A(P)}}}function kt(e,t,i){let r,a,{theme:c="auto"}=t,{dark_theme:k=""}=t,{light_theme:b=""}=t,{light_icon:n=""}=t,{light_color:o=""}=t,{dark_icon:w=""}=t,{dark_color:g=""}=t,{dark_highlight:p=""}=t,{light_highlight:s=""}=t;const y=window.localStorage.getItem("theme");y&&(console.log("\u{1F680} ~ file: ThemeSwitch.svelte ~ line 10 ~ savedTheme",y),c=y,j(y));function j(l){i(0,c=l),document.querySelector("html").setAttribute("data-theme",c);const H=document.querySelector("meta[name='theme-color']");H&&k&&b&&H.setAttribute("content",c==="dark"?k:b),window.localStorage.setItem("theme",c)}function T(l){l.target.checked&&j(l.target.value)}const O=[[]];function P(){c=this.__value,i(0,c)}function q(){c=this.__value,i(0,c)}function S(){c=this.__value,i(0,c)}return e.$$set=l=>{"theme"in l&&i(0,c=l.theme),"dark_theme"in l&&i(10,k=l.dark_theme),"light_theme"in l&&i(11,b=l.light_theme),"light_icon"in l&&i(1,n=l.light_icon),"light_color"in l&&i(2,o=l.light_color),"dark_icon"in l&&i(3,w=l.dark_icon),"dark_color"in l&&i(4,g=l.dark_color),"dark_highlight"in l&&i(5,p=l.dark_highlight),"light_highlight"in l&&i(6,s=l.light_highlight)},e.$$.update=()=>{e.$$.dirty&2&&i(8,r=n&&`url(${n})`),e.$$.dirty&8&&i(7,a=w&&`url(${w})`)},[c,n,o,w,g,p,s,a,r,T,k,b,P,O,q,S]}class bt extends X{constructor(t){super(),this.shadowRoot.innerHTML='<style>.switch-wrapper{position:relative;display:inline-grid;grid-template:"switch";place-items:center;place-content:center}.switch-wrapper>*{grid-area:switch}.switch-inner{display:flex;position:relative;z-index:10;align-items:center;height:1rem}.light{display:flex;position:relative;justify-content:flex-end;align-items:center;width:1.5rem;height:1.5rem;padding-right:0.75rem}.auto{position:relative;width:1.5rem;height:1.5rem}.dark{display:flex;position:relative;align-items:center;width:1.5rem;height:1.5rem;padding-left:0.75rem}input{display:block;position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;cursor:pointer;opacity:0}[part]{cursor:pointer;font-size:0.8rem;text-transform:uppercase;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;font-weight:700}[part="auto"]{display:block;position:absolute;width:200%;top:-0.9rem;left:50%;transform:translate(-50%, 0%);text-align:center}.knob{left:0.75rem;position:absolute;top:0;background-color:var(--lil-red-switch-knob, #ffffff);transition-property:all;transition-duration:300ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);width:1rem;height:1rem;border-radius:9999px;border:var(--lil-red-switch-knob-border, 2px solid #a7afb0);box-sizing:border-box}.knob-inner{background-color:var(--lil-red-switch-track, #6b7280d0);width:2.5rem;height:1rem;border-radius:9999px;box-shadow:inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)}.knob-wrapper{position:relative}[data-theme="light"] .knob{left:0}[data-theme="dark"] .knob{left:1.5rem}[data-theme="light"]{color:var(--lil-red-switch-light-color, inherit)}[data-theme="light"] .light{color:var(--lil-red-switch-light-highlight, inherit)}[data-theme="dark"]{color:var(--lil-red-switch-dark-color, inherit)}[data-theme="dark"] .dark{color:var(--lil-red-switch-dark-highlight, inherit)}[data-theme="auto"] .auto{color:var(--lil-red-switch-light-highlight, inherit)}@media(prefers-color-scheme: dark){[data-theme="auto"] .auto{color:var(--lil-red-switch-dark-highlight, inherit)}}.icon{-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;width:1rem;height:1rem;background-color:var(--lil-red-switch-light-color, #555)}.light .icon{-webkit-mask-position:right;mask-position:right}[data-theme="light"] .icon{background-color:var(--lil-red-switch-light-color, #555)}[data-theme="light"] .light .icon{background-color:var(--lil-red-switch-light-highlight, inherit)}[data-theme="dark"] .icon{background-color:var(--lil-red-switch-dark-color, #aaa)}[data-theme="dark"] .dark .icon{background-color:var(--lil-red-switch-dark-highlight, inherit)}@media(prefers-color-scheme: dark){[data-theme="auto"] .icon{background-color:var(--lil-red-switch-dark-color, #aaa)}}</style>',dt(this,{target:this.shadowRoot,props:it(this.attributes),customElement:!0},kt,mt,Y,{theme:0,dark_theme:10,light_theme:11,light_icon:1,light_color:2,dark_icon:3,dark_color:4,dark_highlight:5,light_highlight:6},null),t&&(t.target&&L(t.target,this,t.anchor),t.props&&(this.$set(t.props),v()))}static get observedAttributes(){return["theme","dark_theme","light_theme","light_icon","light_color","dark_icon","dark_color","dark_highlight","light_highlight"]}get theme(){return this.$$.ctx[0]}set theme(t){this.$$set({theme:t}),v()}get dark_theme(){return this.$$.ctx[10]}set dark_theme(t){this.$$set({dark_theme:t}),v()}get light_theme(){return this.$$.ctx[11]}set light_theme(t){this.$$set({light_theme:t}),v()}get light_icon(){return this.$$.ctx[1]}set light_icon(t){this.$$set({light_icon:t}),v()}get light_color(){return this.$$.ctx[2]}set light_color(t){this.$$set({light_color:t}),v()}get dark_icon(){return this.$$.ctx[3]}set dark_icon(t){this.$$set({dark_icon:t}),v()}get dark_color(){return this.$$.ctx[4]}set dark_color(t){this.$$set({dark_color:t}),v()}get dark_highlight(){return this.$$.ctx[5]}set dark_highlight(t){this.$$set({dark_highlight:t}),v()}get light_highlight(){return this.$$.ctx[6]}set light_highlight(t){this.$$set({light_highlight:t}),v()}}customElements.define("lil-red-theme-switch",bt);
