import { Component } from "can";

import "../turning-arrow/turning-arrow";

import "./expandable-section.less";

export default Component.extend({
	tag: "expandable-section",

	ViewModel: {
		height: { type: "number", default: 300 },
		title: { type: "string", default: "Expandable Section" },
		collapsible: { type: "boolean", default: true },
		/**
		 * The section element
		 */
		sectionEl: "any",
		/**
		 * Section header
		 */
		sectionTitle: "any",
		expanded: {
			default: false,
			value({ lastSet, listenTo, resolve }) {
				let collapsible = this.collapsible;

				resolve(collapsible ? lastSet.get() : true);

				listenTo(lastSet, (newVal) => {
					if (collapsible) {
						resolve(newVal);
					}
				});

				listenTo("collapsible", (ev, newVal) => {
					collapsible = newVal;

					if (!collapsible) {
						resolve(true);
					}
				});
			}
		},
	},

	view: `
		<div class="{{# if(collapsible) }}collapsible{{/ if }}" on:click="expanded = not(expanded)" {{# if(expanded) }}style="max-height: {{height}}px"{{/ if }}>
			<div this:to="sectionTitle" class="title">
				{{# if(collapsible) }}
					<turning-arrow down:bind="expanded" />
				{{/ if }}
				<p {{# not(collapsible) }}class="not-collapsible"{{/ not }}>{{title}}</p>
			</div>
			<div this:to="sectionEl" class="content-container {{# if(expanded) }}expanded{{/ if }}" on:click="scope.event.stopPropagation()">
				<content/>
			</div>
		</div>
	`
});
