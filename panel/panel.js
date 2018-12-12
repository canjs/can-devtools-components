import { Component, DefineMap, DefineList } from "can";

import "component-tree/component-tree";
import "panel/panel.less";

export default Component.extend({
	tag: "components-panel",
	ViewModel: {
		connectedCallback() {
			this.listenTo("selectedNode", (ev, node) => {
				console.log("selected node", node);
			});
		},
		componentTree: DefineList,
		selectedNode: DefineMap
	},
	view: `
		<div class="grid-container">
			<div class="tree-view">
				<div class="component-tree-header">
					<h1>CanJS Components</h1>
					<div class="filters">
						{{! <p><input placeholder="Filter Components"></p> }}
					</div>
				</div>
				<div class="component-tree">
					<component-tree
						componentTree:from="componentTree"
						selectedNode:to="selectedNode"
					></component-tree>
				</div>
			</div>
			<div class="sidebar">
			</div>
		</div>
	`
});

export { Component, DefineMap, DefineList };
