import { Component, DefineList } from "can";
import "../utils/add-enter-event";

import "./breakpoints-editor.less";

export default Component.extend({
	tag: "breakpoints-editor",
	ViewModel: {
		breakpoints: { Type: DefineList, Default: DefineList },

		newBreakpointKey: {
			default: "",
			value({ listenTo, resolve, lastSet }) {
				resolve(lastSet.get());

				listenTo(lastSet, resolve);

				listenTo("breakpoints", () => {
					resolve("");
				});
			}
		},

		addBreakpoint: {
			default: () =>
				(key) => console.log(`adding breakpoint for ${key}`)
		},

		toggleBreakpoint: {
			default: () =>
				(key) => console.log(`toggling breakpoint for ${key}`)
		},

		deleteBreakpoint: {
			default: () =>
				(key) => console.log(`deleting breakpoint for ${key}`)
		}
	},
	view: `
		<p>
			<input
				placeholder="Add breakpoint"
				value:from="newBreakpointKey"
				on:input:value:to="newBreakpointKey"
				on:enter="addBreakpoint(newBreakpointKey)">

			<button
				{{# not(newBreakpointKey) }}class="disabled"{{/ not }}
				on:click="addBreakpoint(newBreakpointKey)"
				title="Add breakpoint for {{ newBreakpointKey }}"
			>
				&#x2b90;
			</button>
		</p>

		<div class="breakpoints-list">
			{{# if(this.breakpoints.length) }}
				{{# for(bp of this.breakpoints) }}
					<div class="breakpoint-container">
						<input
							type="checkbox"
							checked:from="bp.enabled"
							title="Toggle breakpoint"
							on:click="this.toggleBreakpoint(bp.key)">

						<div>{{ bp.key }}</div>

						<div
							class="delete-button"
							title="Delete breakpoint"
							on:click="this.deleteBreakpoint(bp.key)"
						>&minus;</div>
					</div>
				{{/ for }}
			{{ else }}
				<p class="no-breakpoints">No breakpoints</p>
			{{/ if }}
		</div>
	`
});

export { Component };
