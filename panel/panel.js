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
				if (this.breakpoints.length === 0) {
					return this.scrollableAreaHeight - this.breakpointsCurrentHeight;
				} else {
					return Math.ceil(2 * this.scrollableAreaHeight / 3);
				}
			}
			// remove the title height in order to prevent scroll over breakpoint section
			return this.scrollableAreaHeight - this.breakpointsTitleHeight;
		},
		get breakpointsHeight() {
			return Math.floor((1 * this.scrollableAreaHeight) / 3);
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

		//breakpoints DOM fields
		breakpointsExpanded: "boolean",
		breakpointsTitle: "any",
		breakpointsSection: "any",
		get breakpointsCurrentHeight() {
			if (this.breakpointsSection) {
				return this.breakpointsSection.clientHeight;
			}
			return 0;
		},
		get breakpointsTitleHeight() {
			if (this.breakpointsTitle) {
				return this.breakpointsTitle.clientHeight;
			}
			return 0;
		},

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
			<div class="sidebar">
				<expandable-section title:raw="ViewModel Mutation Breakpoints" 
									height:bind="breakpointsHeight" 
									sectionTitle:to="breakpointsTitle" 
									sectionEl:to="breakpointsSection"
									expanded:to="breakpointsExpanded"
				>
					<breakpoints-editor
						breakpoints:bind="breakpoints"
						addBreakpoint:from="addBreakpoint"
						toggleBreakpoint:from="toggleBreakpoint"
						deleteBreakpoint:from="deleteBreakpoint"
						error:bind="breakpointsError"
					></breakpoints-editor>
				</expandable-section>

				<expandable-section title:raw="ViewModel Editor" expanded:from="true" height:bind="viewModelEditorHeight">
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
