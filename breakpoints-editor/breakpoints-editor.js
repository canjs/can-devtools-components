import { ObservableArray, StacheElement, type } from "can";

import "../utils/add-enter-event";
import "./breakpoints-editor.less";

export default class BreakpointsEditor extends StacheElement {
	static get view() {
		return `
			<p>
				<input
					placeholder="Add breakpoint"
					value:from="this.newBreakpointKey"
					on:input:value:to="this.newBreakpointKey"
					on:enter="this.addBreakpoint(newBreakpointKey)"
				>

				<button
					{{# not(this.newBreakpointKey) }}class="disabled"{{/ not }}
					on:click="this.addBreakpoint(this.newBreakpointKey)"
					title="Add breakpoint for {{ this.newBreakpointKey }}"
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
									on:click="this.toggleBreakpoint(bp)"
								>
								<div>{{ bp.expression }}</div>
							</div>
							<div
								class="delete-button"
								title="Delete breakpoint"
								on:click="this.deleteBreakpoint(bp)"
							>
								&minus;
							</div>
						</div>
					{{/ for }}
				{{ else }}
					{{# if(this.editorError) }}
						<p class="error">{{ this.editorError }}</p>
					{{ else }}
						<p class="no-breakpoints">No breakpoints</p>
					{{/ if }}
				{{/ if }}
			</div>
		`;
	}

	static get props() {
		return {
			breakpoints: {
				type: type.convert(ObservableArray),

				get default() {
					return new ObservableArray();
				}
			},

			editorError: String,

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
				get default() {
					return expression =>
						console.log(`adding breakpoint for ${expression}`);
				}
			},

			toggleBreakpoint: {
				get default() {
					return breakpoint => console.log("toggling breakpoint", breakpoint);
				}
			},

			deleteBreakpoint: {
				get default() {
					return breakpoint => console.log("deleting breakpoint", breakpoint);
				}
			}
		};
	}
}

customElements.define("breakpoints-editor", BreakpointsEditor);

export { StacheElement };
