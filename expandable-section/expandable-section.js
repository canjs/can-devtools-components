import { Component } from "can";
import "./expandable-section.less";

export default Component.extend({
	tag: "expandable-section",

	ViewModel: {
		title: { type: "string", default: "Expandable Section" },
		collapsible: { type: "boolean", default: true },
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
		<div class="{{# if(collapsible) }}collapsible{{/ if }}" on:click="expanded = not(expanded)">
			<div class="title">
				{{# if(collapsible) }}<span class="arrow"></span>{{/ if }}<p {{# not(collapsible) }}class="not-collapsible"{{/ not }}>{{title}}</p>
			</div>
			<div class="content-container {{# if(expanded) }}expanded{{/ if }}">
				<content/>
			</div>
		</div>
	`
});
