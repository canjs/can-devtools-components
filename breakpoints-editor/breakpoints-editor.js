import { Component, DefineList } from "can";
import "../utils/add-enter-event";

import "./breakpoints-editor.less";

export default Component.extend({
	tag: "breakpoints-editor",
	ViewModel: {
		breakpoints: { Type: DefineList, Default: DefineList },
		error: "string",

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
				(expression) => console.log(`adding breakpoint for ${expression}`)
		},

		toggleBreakpoint: {
			default: () =>
				(breakpoint) => console.log("toggling breakpoint", breakpoint)
		},

		deleteBreakpoint: {
			default: () =>
				(breakpoint) => console.log("deleting breakpoint", breakpoint)
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
						<div class="check-list">
							<input
								type="checkbox"
								checked:from="bp.enabled"
								title="Toggle breakpoint"
								on:click="this.toggleBreakpoint(bp)">

							<div>{{ bp.expression }}</div>
						</div>

						<div
							class="delete-button"
							title="Delete breakpoint"
							on:click="this.deleteBreakpoint(bp)"
						>&minus;</div>
					</div>
				{{/ for }}
			{{ else }}
				{{# if(error) }}
					<p class="error">{{error}}</p>
				{{ else }}
					<p class="no-breakpoints">No breakpoints</p>
				{{/ if }}
			{{/ if }}
		</div>
	`
});

export { Component };
