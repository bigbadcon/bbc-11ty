class i extends HTMLElement{getNumber(e){const t=Number(e.getAttribute("maxlength")||1/0);this.textContent=String(this.hasAttribute("remaining")?t-e.value.length:e.value.length)}connectedCallback(){var n;const e=this.getAttribute("for"),t=e?document.getElementById(e):(n=this.closest("label"))==null?void 0:n.querySelector("input, textarea");(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&(this.getNumber(t),t.addEventListener("input",()=>this.getNumber(t)))}}customElements.define("af-text-count",i);
//# sourceMappingURL=af-text-count.js.map