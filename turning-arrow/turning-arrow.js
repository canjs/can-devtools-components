import { StacheElement } from "can";

import "./turning-arrow.less";

export default class TurningArrow extends StacheElement {
	static get view() {
		return `
			{{# if(this.down) }}
				<div class="arrow down {{# if(this.animate) }}animate{{/ if }}"></div>
			{{ else }}
				<div class="arrow right {{# if(this.animate) }}animate{{/ if }}"></div>
			{{/ if }}
		`;
	}

	static get props() {
		return {
			down: { type: Boolean, default: false },
			animate: {
				value({ listenTo, resolve, stopListening }) {
					// don't animate when arrow is added to the page
					resolve(false);

					// animate after down changes
					listenTo("down", () => {
						resolve(true);
						// don't need to listen anymore
						stopListening();
					});
				}
			}
		};
	}
}

customElements.define("turning-arrow", TurningArrow);
