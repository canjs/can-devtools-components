import { Component, DefineMap, DefineList, Reflect } from "can";

import "panel/panel.less";

import "component-tree/component-tree";
import "viewmodel-editor/viewmodel-editor";
import "expandable-section/expandable-section";

export default Component.extend({
	tag: "components-panel",
	ViewModel: {
		connectedCallback(el) {
			const setHeight = () => {
				this.scrollableAreaHeight = el.clientHeight;
			};

			// set default height
			setHeight();

			// set height when page is resized
			window.addEventListener("resize", setHeight);

			return () => {
				window.removeEventListener("resize", setHeight);
			};
		},
		scrollableAreaHeight: { type: "number", default: 400 },
		componentTree: DefineList,
		selectedNode: DefineMap,
		viewModelData: DefineMap,
		typeNamesData: DefineMap,
		messages: DefineMap,
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
			<div class="tree-view" style="height: {{scrollableAreaHeight}}px">
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
				<expandable-section title:raw="ViewModel Editor" collapsible:from="false" height:bind="scrollableAreaHeight">
					<viewmodel-editor
						tagName:from="this.selectedNode.tagName"
						viewModelData:bind="viewModelData"
						typeNamesData:bind="typeNamesData"
						messages:bind="messages"
						updateValues:from="updateValues"
						expandedKeys:to="expandedKeys"
					></viewmodel-editor>
				</expandable-section>
			</div>
		</div>
	`
});

export { Component, DefineMap, DefineList, Reflect };
