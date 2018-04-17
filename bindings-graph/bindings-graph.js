import Component from "can-component";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";
import "./bindings-graph.less";
import vis from "can-debug/src/draw-graph/vis";

export default Component.extend({
	tag: "bindings-graph",
	ViewModel: {
		graphData: DefineMap,
        availableKeys: DefineList,
		selectedObj: "string",
        selectedKey: "string",

		connectedCallback(element) {
			var drawGraph = function(data) {
				// remove previous graph
				var oldContainer = element.querySelector("div");
				if (oldContainer) {
					oldContainer.remove();
				}

				// create new graph container and add it
				var container = document.createElement("div");
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
			}

			this.listenTo("graphData", function(ev, data) {
				drawGraph(data);
			});

			drawGraph(this.graphData);
		}
	},
	view: `
		<h1>{{selectedObj}}.{{selectedKey}}</h1>
	`
});
