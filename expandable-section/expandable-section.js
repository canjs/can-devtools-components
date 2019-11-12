import { StacheElement, type } from "can";

import "../turning-arrow/turning-arrow";
import "./expandable-section.less";

export default class ExpandableSection extends StacheElement {
	static get view() {
		return `
			<div
				class="{{# if(this.collapsible) }}collapsible{{/ if }}"
				on:click="this.expanded = not(this.expanded)"
			>
				<div this:to="this.sectionTitle" class="title">
					{{# if(this.collapsible) }}
						<turning-arrow down:bind="this.expanded" />
					{{/ if }}
					<p {{# not(this.collapsible) }}class="not-collapsible"{{/ not }}>
						{{ this.title }}
					</p>
				</div>
				<div
					class="content-container {{# if(this.expanded) }}expanded{{/ if }}"
					on:click="scope.event.stopPropagation()"
					style="height: {{ this.height }}px"
				>
					<div>{{ this.contentTemplate(section = this) }}</div>
				</div>
			</div>
		`;
	}

	static get props() {
		return {
			height: { type: Number, default: 300 },
			title: { type: String, default: "Expandable Section" },
			collapsible: { type: Boolean, default: true },
			sectionTitle: type.Any,
			contentTemplate: { type: Function, required: true },
			expanded: {
				default: false,
				value({ lastSet, listenTo, resolve }) {
					let collapsible = this.collapsible;

					resolve(collapsible ? lastSet.get() : true);

					listenTo(lastSet, newVal => {
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
			}
		};
	}
}

customElements.define("expandable-section", ExpandableSection);
