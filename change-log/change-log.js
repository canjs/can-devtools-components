import { Component, DefineList } from "can";
import "change-log/change-log.less";

Component.extend({
	tag: "change-log",

	ViewModel: {
		breakpoints: { Type: DefineList, Default: DefineList },

		patches: { Type: DefineList, Default: DefineList },

		addBreakpoint(el) {
			this.breakpoints.push({ key: el.value });
			el.value = "";
		}
	},

	view: `
		<div class="breakpoints">
			Breakpoints:
			{{# for(breakpoint of this.breakpoints) }}
				<p>"{{ breakpoint.key }}"<span>-</span></p>
			{{/ for }}
			<p><input placeholder="key" on:enter="addBreakpoint(scope.element)"></p>
		</div>

		<div class="changes">
			Changes:
			{{# for(patch of patches) }}
				<p>"{{ patch.key }}" {{ patch.type }} to {{ patch.value }}</p>
			{{/ for }}
		</div>
	`,
});

export { Component };
