import { ObservableArray, ObservableObject, StacheElement, type, Reflect } from "can";
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

			showInternalNodes: false,

			availableKeys: {
				type: type.convert(ObservableArray),

				get default() {
					return new ObservableArray();
				}
			},

			selectedObj: String,

			selectedKey: {
				type: type.maybe(String),

				value({ resolve, listenTo, lastSet }) {
					let selected = null;
					// all key to be set
					listenTo(lastSet, setVal => {
						selected = resolve(setVal);
					});

					listenTo(this.availableKeys, 'length', (ev, newLength) => {
						if (newLength && !selected || !this.availableKeys.includes(selected)) {
							selected = resolve(this.availableKeys[0]);
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

export { StacheElement, type, ObservableArray, ObservableObject, Reflect };
