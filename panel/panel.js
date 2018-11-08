import { Component, Symbol, Reflect, DefineList, value } from "can";

import ChangeLog from "change-log/change-log";
import ViewModelEditor from "viewmodel-editor/viewmodel-editor";
import BindingsGraph from "bindings-graph/bindings-graph";

import "panel/panel.less";
import "components-tree-view/components-tree-view";

const getComponentElements = (el) => {
	return [].map.call(el.childNodes, (child) => {
		if (child.tagName === "CANJS-DEVTOOLS-PANEL") {
			return [ ];
		}

		if ("viewModel" in child) {
			return {
				el: child,
				tagName: child.tagName.toLowerCase(),
				children: getComponentElements(child).flat()
			};
		} else {
			return getComponentElements(child);
		}
	}).filter((node) => {
		if ( Array.isArray(node) ) {
			return node.length > 0;
		}

		return true;
	});
};

const getSerializedViewModel = (el) => {
	const viewModel = el.viewModel

	const viewModelData = typeof viewModel.serialize === "function" ?
		viewModel.serialize() :
		JSON.parse( JSON.stringify(viewModel) );

	const viewModelKeys = Reflect.getOwnKeys( viewModel );

	for (let i=0; i<viewModelKeys.length; i++) {
		const key = viewModelKeys[i];
		if (!viewModelData[ key ]) {
			viewModelData[key] = Reflect.getKeyValue( viewModel, key );
		}
	}

	// sort viewModel data in alphabetical order
	const sortedViewModel = {};

	Object.keys(viewModelData).sort().forEach(function(key) {
		sortedViewModel[key] = viewModelData[key];
	});

	return sortedViewModel;
};

export default Component.extend({
	tag: "canjs-devtools-panel",

	ViewModel: {
		selectedElement: {
			set(el) {
				el.viewModel.on("name", () => {
					can.queues.logStack();
					debugger;
				}, "notify")

				return el;
			}
		},

		get selectedElementTagName() {
			return this.selectedElement && `<${this.selectedElement.tagName.toLowerCase()}>`;
		},

		get selectedElementViewModelData() {
			if ( !this.selectedElement || !("viewModel" in this.selectedElement) ) {
				return {};
			}

			return getSerializedViewModel(this.selectedElement);
		},

		selectedElementViewModelPatches: {
			value({ listenTo, resolve }) {
				const patches = resolve( new DefineList() );
				let vm = null;

				const addPatch = (newPatches) => {
					patches.push(...newPatches);
				};

				listenTo("selectedElement", (ev, el) => {
					if (vm) {
						Reflect.offPatches(vm, addPatch);
					}

					vm = el.viewModel;

					patches.updateDeep([]);

					Reflect.onPatches(vm, addPatch);
				});
			}
		},

		updateSelectedElementViewModel(data) {
			const vm = this.selectedElement.viewModel
			Reflect.assignDeep(vm, data);
		},

		selectedElementsTree: {
			value({ listenTo, resolve }) {
				resolve([]);

				setTimeout(() => {
					resolve( getComponentElements( document.querySelector("body") ) );
				}, 500);
			}
		},

		selectElementFromNode(node) {
			this.selectedElement = node.el;
		},

		selectedSidebar: { type: "string", default: "ViewModelEditor" },

		get sidebarComponentData() {
			switch(this.selectedSidebar) {
				case "ViewModelEditor":
					return {
						showHeading: false,
						tagName: value.from(this, "selectedElementTagName"),
						viewModelData: value.from(this, "selectedElementViewModelData"),
						updateValues: value.from(this, "updateSelectedElementViewModel")
					};
				case "BindingsGraph":
					break;
				case "ChangeLog":
					return {
						patches: value.from(this, "selectedElementViewModelPatches")
					};
			}
		},

		get sidebarComponent() {
			const constructors = { ViewModelEditor, BindingsGraph, ChangeLog };

			return new constructors[this.selectedSidebar]({
				viewModel: this.sidebarComponentData
			});
		}
	},

	view: `
		<div class="grid-container">
			<div class="header">
				<h1>CanJS Components</h1>
			</div>

			<div class="filters">
				<p><input placeholder="Filter Components"></p>
			</div>

			<div class="tabs">
				<p {{# eq(selectedSidebar, "ViewModelEditor") }}class="selected"{{/ eq }} on:click="this.selectedSidebar = 'ViewModelEditor'">VM</p>
				<p {{# eq(selectedSidebar, "BindingsGraph") }}class="selected"{{/ eq }} on:click="this.selectedSidebar = 'BindingsGraph'">Bindings</p>
				<p class="last {{# eq(selectedSidebar, "ChangeLog") }}selected{{/ eq }}" on:click="this.selectedSidebar = 'ChangeLog'">Log</p>
			</div>

			<div class="content">
				<components-tree-view
					tree:from="selectedElementsTree"
					selectNode:from="selectElementFromNode"
				></components-tree-view>
			</div>

			<div class="sidebar">
				{{ sidebarComponent }}
			</div>
		</div>
	`
});

export { Component };
