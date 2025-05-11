export class SoonBadge extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = `<span class="soon-badge">soon</span>`;
	}
}

export type TSoonBadge = SoonBadge;

customElements.define("soon-badge", SoonBadge);
