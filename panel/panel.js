import { Component, DefineMap, DefineList, Reflect } from "can";

import "component-tree/component-tree";
import "viewmodel-editor/viewmodel-editor";
import "panel/panel.less";

export default Component.extend({
	tag: "components-panel",
	ViewModel: {
		componentTree: DefineList,
		selectedNode: DefineMap,
		viewModelData: DefineMap,
		typeNamesData: DefineMap,
		expandedKeys: DefineList,
		updateValues: {
			default() {
				return (data) => {
					console.log("updating viewModel with", data);
				};
			}
		}
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
						componentTree:bind="componentTree"
						selectedNode:to="selectedNode"
					></component-tree>
				</div>
			</div>
			<div class="sidebar">
				<div class="viewmodel-editor">
					<h2>
						ViewModel Editor
					</h2>
					<div class="sidebar-container">
						<viewmodel-editor
							tagName:from="this.selectedNode.tagName"
							viewModelData:bind="viewModelData"
							typeNamesData:bind="typeNamesData"
							updateValues:from="updateValues"
							expandedKeys:to="expandedKeys"
						></viewmodel-editor>
					</div>
				</div>
			</div>
		</div>
	`
});

export { Component, DefineMap, DefineList, Reflect };
