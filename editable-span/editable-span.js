import { Component, DefineList } from "can";
import "../utils/add-enter-event";
import "./editable-span.less";

const selectContents = (el) => {
	setTimeout(() => {
		if ( document.body.contains(el) ) {
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(el);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}, 0);
};

export default Component.extend({
	tag: "editable-span",

	ViewModel: {
		options: DefineList,

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
		},

		edit(ev) {
			ev.stopPropagation();
			this.editing = true;
		},

		save(value) {
			this.dispatch("set-value", [ value.trim() ]);
		},

		connectedCallback(el) {
			const span = el.querySelector("span");

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

			this.listenTo(el, "focus", () => {
				this.editing = true;
			});
		}
	},

	view: `
		<span
			on:click="edit(scope.event)"
			on:blur="save(scope.element.innerText)"
			on:enter="save(scope.element.innerText)"
			{{#if(editing)}}class="editing" contenteditable="true"{{/if}}
			tabindex="0"
		>
			{{text}}
		</span>

		{{#if(showOptions)}}
			<ul>
				{{#each(options)}}
					<li on:mousedown="scope.vm.save(this)">{{this}}</li>
				{{/each}}
			</ul>
		{{/if}}
	`,

	events: {
		"li mouseover"(li) {
			li.classList.add("highlight");
		},

		"li mouseout"(li) {
			li.classList.remove("highlight");
		}
	}
});
