import Component from "can-component";
import DefineList from "can-define/list/list";
import domEvents from "can-dom-events";
import enterEvent from "can-event-dom-enter";
import "./magic-input.less";

// add support for on:enter
domEvents.addEvent(enterEvent);

export default Component.extend({
	tag: "magic-input",

	ViewModel: {
		value: "string",
		options: DefineList,

		editing: { type: "boolean", default: false },

		get showOptions() {
			return this.editing && this.options && this.options.length;
		},

		edit(ev) {
			if (ev) { ev.stopPropagation() }
			this.editing = true;
		},

		save(value) {
			this.value = value.trim();
			this.editing = false;
		}
	},

	view: `
		<span
			on:click="edit(scope.event)"
			on:blur="save(scope.element.innerText)"
			on:enter="save(scope.element.innerText)"
			{{#if(editing)}}class="editing" contenteditable="true"{{/if}}
		>
			{{value}}
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
		"li mouseover": function(li) {
			li.classList.add("highlight");
		},

		"li mouseout": function(li) {
			li.classList.remove("highlight");
		}
	}
});
