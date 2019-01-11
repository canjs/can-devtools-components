import { Component } from "can";

import "./turning-arrow.less";

export default Component.extend({
	tag: "turning-arrow",

	ViewModel: {
		down: { type: "boolean", default: false },
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
	},

	view: `
		{{# if(down) }}
			<div class="arrow down {{# if(animate) }}animate{{/ if }}"></div>
		{{ else }}
			<div class="arrow right {{# if(animate) }}animate{{/ if }}"></div>
		{{/ if }}
	`
});
