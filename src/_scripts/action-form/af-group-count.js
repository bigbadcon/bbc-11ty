var l=Object.defineProperty;var u=(a,e,t)=>e in a?l(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var s=(a,e,t)=>(u(a,typeof e!="symbol"?e+"":e,t),t);class h extends HTMLElement{constructor(){var i;super();s(this,"fieldset",this.closest("fieldset"));s(this,"internals",this.attachInternals());s(this,"shadow");s(this,"value",this.getValue());s(this,"validity",this.checkValidity());s(this,"name",this.getAttribute("name")||"");if(!this.fieldset)throw new Error("no fieldset found");const[t,r]=((i=this.fieldset.dataset.group)==null?void 0:i.split("-"))||[];this.min=Number(t||this.min),this.max=Number(r||this.max),this.shadow=this.attachShadow({mode:"open"}),this.shadow.innerHTML=`${this.value}`,this.checkValidity(),this.setAttribute("aria-describedby",this.fieldset.getAttribute("aria-describedby")||""),this.fieldset.addEventListener("change",n=>{n.target!==this&&this.checkValidity()})}get min(){return Number(this.getAttribute("min")||0)}set min(t){this.setAttribute("min",String(t))}get max(){return Number(this.getAttribute("max")||1/0)}set max(t){this.setAttribute("max",String(t))}attributeChangedCallback(){this.checkValidity()}checkValidity(){const t=this.getValue();return t!==this.value&&(this.value=t,this.shadow.innerHTML=`${t}`,this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))),this.validity=t>=this.min&&t<=this.max,this.setValidity(),this.validity}getValue(){if(!this.fieldset)throw new Error("no fieldset found");const t=this.fieldset.querySelectorAll("input, select, textarea");return Array.from(t).filter(i=>i instanceof HTMLInputElement&&["checkbox","radio"].includes(i.type)?i.checked:i.checkValidity()&&i.value).length}setValidity(){const t=this.validity?{}:{customError:!0},r=this.validity?"":"Value is out of range";this.internals.setValidity(t,r),this.setAttribute("validity",String(this.validity))}}s(h,"formAssociated",!0);customElements.define("af-group-count",h);
//# sourceMappingURL=af-group-count.js.map