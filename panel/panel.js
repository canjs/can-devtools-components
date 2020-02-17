import {
	DeepObservable,
	ObservableArray,
	ObservableObject,
	Reflect,
	StacheElement,
	type
} from "can";

import "panel/panel.less";

import "component-tree/component-tree";
import "viewmodel-editor/viewmodel-editor";
import "expandable-section/expandable-section";
import "breakpoints-editor/breakpoints-editor";

export default class ComponentsPanel extends StacheElement {
	static get view() {
		return `
			<div class="grid-container">
				<div class="tree-view" style="height: {{ this.scrollableAreaHeight }}px">
					<div class="component-tree-header">
						<h1>CanJS Components</h1>
						<div class="filters">
							<p><input placeholder="Filter Components" on:input="this.filterString = scope.element.value"></p>
						</div>
					</div>
					<div class="component-tree">
						<component-tree
							componentTree:bind="this.componentTree"
							selectedNode:to="this.selectedNode"
							treeError:bind="this.componentTreeError"
							filterString:from="this.filterString"
						></component-tree>
					</div>
				</div>
				<div class="sidebar" style="height: {{ this.scrollableAreaHeight }}px">
					<expandable-section
						title:raw="Observable Properties Mutation Breakpoints"
						sectionTitle:to="this.breakpointsTitle"
						height:from="this.breakpointsHeight"
						expanded:bind="this.breakpointsExpanded"
					>
						<can-template name="contentTemplate">
							<breakpoints-editor
								breakpoints:bind="this.breakpoints"
								addBreakpoint:from="this.addBreakpoint"
								toggleBreakpoint:from="this.toggleBreakpoint"
								deleteBreakpoint:from="this.deleteBreakpoint"
								editorError:bind="this.breakpointsError"
							></breakpoints-editor>
						</can-template>
					</expandable-section>

					<expandable-section
						title:raw="Observable Properties Editor"
						expanded:from="true"
						sectionTitle:to="this.viewModelTitle"
						height:from="this.viewModelEditorHeight"
					>
						<can-template name="contentTemplate">
							<viewmodel-editor
								tagName:from="this.tagName"
								viewModelData:bind="this.viewModelData"
								typeNamesData:bind="this.typeNamesData"
								messages:bind="this.messages"
								undefineds:bind="this.undefineds"
								updateValues:from="this.updateValues"
								expandedKeys:to="this.expandedKeys"
								editorError:bind="this.viewModelEditorError"
							></viewmodel-editor>
						</can-template>
					</expandable-section>
				</div>
			</div>
		`;
	}

	static get props() {
		return {
			scrollableAreaHeight: { type: Number, default: 400 },

			get viewModelEditorHeight() {
				if (this.breakpointsExpanded) {
					return (
						this.scrollableAreaHeight -
						this.breakpointsHeight -
						(this.breakpointsTitleHeight + this.viewModelTitleHeight)
					);
				}
				return (
					this.scrollableAreaHeight -
					(this.breakpointsTitleHeight + this.viewModelTitleHeight)
				);
			},

			get breakpointsHeight() {
				return (
					Math.floor(1 * this.scrollableAreaHeight / 3) -
					this.breakpointsTitleHeight
				);
			},

			filterString: { type: String, default: "" },

			// component tree fields
			componentTree: type.convert(ObservableArray),

			selectedNode: type.maybeConvert(ObservableObject),
			componentTreeError: String,
			tagName: "",

			// viewmodel editor fields
			viewModelData: DeepObservable,

			typeNamesData: type.convert(ObservableObject),
			messages: type.convert(ObservableObject),
			undefineds: type.convert(ObservableArray),
			expandedKeys: type.convert(ObservableArray),
			viewModelEditorError: String,

			// breakpoints fields
			breakpoints: type.convert(ObservableArray),

			breakpointsError: type.convert(String),
			breakpointsExpanded: Boolean,

			//breakpoints DOM fields
			breakpointsTitle: type.Any,

			viewModelTitle: type.Any,
			breakpointsTitleHeight: Number,
			viewModelTitleHeight: Number,

			// viewmodel editor functions
			updateValues: {
				get default() {
					return data => console.log("updating viewModel with", data);
				}
			},

			// breakpoints functions
			addBreakpoint: {
				get default() {
					return key => console.log(`adding breakpoint for ${key}`);
				}
			},

			toggleBreakpoint: {
				get default() {
					return key => console.log(`toggling breakpoint for ${key}`);
				}
			},

			deleteBreakpoint: {
				get default() {
					return key => console.log(`deleting breakpoint for ${key}`);
				}
			}
		};
	}

	connected() {
		const setHeight = () => {
			this.scrollableAreaHeight = this.clientHeight;
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
	}
}

customElements.define("components-panel", ComponentsPanel);

export { StacheElement, DeepObservable, ObservableObject, ObservableArray, Reflect, type };
