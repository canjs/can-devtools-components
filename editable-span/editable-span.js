import { Control, ObservableArray, StacheElement, type } from "can";

import "../utils/add-enter-event";
import "./editable-span.less";

const selectContents = el => {
	setTimeout(() => {
		if (document.body.contains(el)) {
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(el);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}, 0);
};

export default class EditableSpan extends StacheElement {
	static get view() {
		return `
			<span
				on:click="this.edit(scope.event)"
				on:blur="this.save(scope.element.innerText)"
				on:enter="this.save(scope.element.innerText)"
				class="{{# if(this.editing) }}editing{{/ if }} {{# if(this.wrapInQuotes) }}quotes{{/ if }}"
				{{# if(this.editing) }}contenteditable="true"{{/ if }}
				tabindex="0"
			>{{ this.text }}</span>

			{{# if(this.showOptions) }}
				<ul>
					{{# for(option of this.options) }}
						<li on:mousedown="this.save(option)">{{ option }}</li>
					{{/ for }}
				</ul>
			{{/ if }}
		`;
	}

	static get props() {
		return {
			options: type.convert(ObservableArray),
			wrapInQuotes: { default: false, type: Boolean },

			text: {
				value({ listenTo, lastSet, resolve }) {
					resolve(lastSet.value);

					listenTo(lastSet, resolve);

					listenTo("set-value", (ev, val) => {
						resolve(val);
					});
				}
			},

			editing: {
				value({ listenTo, lastSet, resolve }) {
					resolve(lastSet.value || false);

					listenTo(lastSet, resolve);

					listenTo("set-value", () => {
						resolve(false);
					});
				}
			},

			get showOptions() {
				return this.editing && this.options && this.options.length;
			}
		};
	}

	connected() {
		const EventsControl = Control.extend({
			"li mouseover"(li) {
				li.classList.add("highlight");
			},

			"li mouseout"(li) {
				li.classList.remove("highlight");
			}
		});

		new EventsControl(this);
		const span = this.querySelector("span");

		const selectSpanContents = () => {
			selectContents(span);
		};

		if (this.editing) {
			selectSpanContents();
		}

		this.listenTo("editing", (ev, editing) => {
			if (editing) {
				selectSpanContents();
			}
		});

		this.listenTo("set-value", (ev, val) => {
			span.innerText = val;
		});

		this.listenTo(this, "focus", () => {
			this.editing = true;
		});
	}

	edit(ev) {
		ev.stopPropagation();
		this.editing = true;
	}

	save(value) {
		this.dispatch("set-value", [value.trim()]);
	}
}
customElements.define("editable-span", EditableSpan);
