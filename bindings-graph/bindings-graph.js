import { ObservableArray, ObservableObject, StacheElement, type } from "can";
import vis from "../lib/vis";
import "../editable-span/editable-span";
import "./bindings-graph.less";

export default class BindingsGraph extends StacheElement {
	static get view() {
		return `
			<h1>
				{{ this.selectedObj }}
				{{# if(this.selectedKey) }}
					<editable-span
						text:bind="this.selectedKey"
						options:from="this.availableKeys"
					/>
				{{/ if }}
			</h1>
		`;
	}

	static get props() {
		return {
			graphData: type.convert(ObservableObject),

			availableKeys: {
				type: type.convert(ObservableArray),

				get default() {
					return new ObservableArray();
				}
			},

			selectedObj: String,

			selectedKey: {
				type: String,

				value({ resolve, listenTo, lastSet }) {
					// all key to be set
					listenTo(lastSet, setVal => {
						resolve(setVal);
					});

					listenTo(this.availableKeys, "length", (ev, newLength) => {
						if (newLength) {
							resolve(this.availableKeys[0]);
						} else {
							resolve(undefined);
						}
					});
				}
			}
		};
	}

	connected() {
		const drawGraph = function(data) {
			// remove previous graph
			const oldContainer = this.querySelector("div");
			if (oldContainer) {
				oldContainer.remove();
			}

			// create new graph container and add it
			const container = document.createElement("div");
			this.appendChild(container);

			new vis.Network(
				container,
				{
					nodes: new vis.DataSet(data && data.nodes && data.nodes),
					edges: new vis.DataSet(data && data.edges && data.edges)
				},
				{
					physics: {
						solver: "repulsion"
					}
				}
			);
		}.bind(this);

		this.listenTo("graphData", function(ev, data) {
			drawGraph(data);
		});

		drawGraph(this.graphData);
	}
}

customElements.define("bindings-graph", BindingsGraph);

export { StacheElement, ObservableArray, ObservableObject };
