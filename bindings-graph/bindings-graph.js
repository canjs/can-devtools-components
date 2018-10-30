import { Component, DefineMap, DefineList } from "can";
import vis from "../lib/vis";
import "../editable-span/editable-span";
import "./bindings-graph.less";


export default Component.extend({
	tag: "bindings-graph",

	ViewModel: {
		graphData: DefineMap,
		availableKeys: { Type: DefineList, Default: DefineList },
		selectedObj: "string",

		selectedKey: {
			type: "string",

			value({ resolve, listenTo, lastSet }) {
				// all key to be set
				listenTo(lastSet, (setVal) => {
					resolve(setVal);
				});

				listenTo(this.availableKeys, "length", (ev, newLength) => {
					if (newLength) {
						resolve( this.availableKeys[0] );
					} else {
						resolve(undefined);
					}
				});
			}
		},

		connectedCallback(element) {
			const drawGraph = function(data) {
				// remove previous graph
				const oldContainer = element.querySelector("div");
				if (oldContainer) {
					oldContainer.remove();
				}

				// create new graph container and add it
				const container = document.createElement("div");
				element.appendChild(container);

				new vis.Network(
					container,
					{
						nodes: new vis.DataSet( data && data.nodes && data.nodes.serialize() ),
						edges: new vis.DataSet( data && data.edges && data.edges.serialize() )
					},
					{
						physics: {
							solver: "repulsion"
						}
					}
				);
			};

			this.listenTo("graphData", function(ev, data) {
				drawGraph(data);
			});

			drawGraph(this.graphData);
		}
	},

	view: `
		<h1>
			{{selectedObj}}
			{{#if(selectedKey)}}
				. <editable-span text:bind="selectedKey" options:from="availableKeys" />
			{{/if}}
		</h1>
	`
});

export { Component, DefineMap, DefineList };
