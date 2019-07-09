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
		sectionEl: {
			type: "any"
		},
		/**
		 * Section header
		 */
		sectionTitle: {
			type: "any"
		},
		/**
		 * the actual section height (height property is for max-height)
		 */
		sectionHeight: {
			value({lastSet, listenTo, resolve}) {
				resolve(lastSet.get());
				listenTo("sectionEl", (ev, el) => {
					resolve(el.clientHeight);
				});
			}
		},
		sectionTitleHeight: {
			value({lastSet, listenTo, resolve}) {
				resolve(lastSet.get());
				listenTo("sectionTitle", (ev, el) => {
					resolve(el.clientHeight);
				});
			}
		},
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
		<div this:to="sectionEl" class="{{# if(collapsible) }}collapsible{{/ if }}" on:click="expanded = not(expanded)" {{# if(expanded) }}style="max-height: {{height}}px"{{/ if }}>
			<div this:to="sectionTitle" class="title">
				{{# if(collapsible) }}
					<turning-arrow down:bind="expanded" />
				{{/ if }}
				<p {{# not(collapsible) }}class="not-collapsible"{{/ not }}>{{title}}</p>
			</div>
			<div class="content-container {{# if(expanded) }}expanded{{/ if }}" on:click="scope.event.stopPropagation()">
				<content/>
			</div>
		</div>
	`
});
