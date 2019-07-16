import { Component, DefineMap, DefineList, Reflect } from "can";

import "panel/panel.less";

import "component-tree/component-tree";
import "viewmodel-editor/viewmodel-editor";
import "expandable-section/expandable-section";
import "breakpoints-editor/breakpoints-editor";

export default Component.extend({
	tag: "components-panel",
	ViewModel: {
		connectedCallback(el) {
			const setHeight = () => {
				this.scrollableAreaHeight = el.clientHeight;
				this.breakpointsTitleHeight = this.breakpointsTitle.clientHeight;
				this.viewModelTitleHeight = this.viewModelTitle.clientHeight;
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
		get viewModelEditorHeight() {
			if (this.breakpointsExpanded) {
				return (this.scrollableAreaHeight - this.breakpointsHeight) - (this.breakpointsTitleHeight + this.viewModelTitleHeight);
			}
			return this.scrollableAreaHeight - (this.breakpointsTitleHeight + this.viewModelTitleHeight);
		},
		get breakpointsHeight() {
			return Math.floor((1 * this.scrollableAreaHeight) / 3)  - this.breakpointsTitleHeight;
		},

		// component tree fields
		componentTree: DefineList,
		selectedNode: DefineMap,
		componentTreeError: "string",

		// viewmodel editor fields
		viewModelData: DefineMap,
		typeNamesData: DefineMap,
		messages: DefineMap,
		undefineds: DefineList,
		expandedKeys: DefineList,
		viewModelEditorError: "string",

		// breakpoints fields
		breakpoints: DefineList,
		breakpointsError: "string",
		breakpointsExpanded: "boolean",

		//breakpoints DOM fields
		breakpointsTitle: "any",
		viewModelTitle: "any",
		breakpointsTitleHeight: "number",
		viewModelTitleHeight: "number",

		// viewmodel editor functions
		updateValues: {
			default: () =>
				(data) => console.log("updating viewModel with", data)
		},
		

		// breakpoints functions
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
						error:bind="componentTreeError"
					></component-tree>
				</div>
			</div>
			<div class="sidebar" style="height: {{scrollableAreaHeight}}px">
				<expandable-section 
					title:raw="ViewModel Mutation Breakpoints" 
					sectionTitle:to="breakpointsTitle" 
					height:from="breakpointsHeight"
					expanded:bind="breakpointsExpanded"
				>
					<breakpoints-editor
						breakpoints:bind="breakpoints"
						addBreakpoint:from="addBreakpoint"
						toggleBreakpoint:from="toggleBreakpoint"
						deleteBreakpoint:from="deleteBreakpoint"
						error:bind="breakpointsError"
					></breakpoints-editor>
				</expandable-section>

				<expandable-section 
					title:raw="ViewModel Editor" 
					expanded:from="true"
					sectionTitle:to="viewModelTitle"
					height:from="viewModelEditorHeight"
				>
					<viewmodel-editor
						tagName:from="this.selectedNode.tagName"
						viewModelData:bind="viewModelData"
						typeNamesData:bind="typeNamesData"
						messages:bind="messages"
						undefineds:bind="undefineds"
						updateValues:from="updateValues"
						expandedKeys:to="expandedKeys"
						error:bind="viewModelEditorError"
					></viewmodel-editor>
				</expandable-section>
			</div>
		</div>
	`
});

export { Component, DefineMap, DefineList, Reflect };
