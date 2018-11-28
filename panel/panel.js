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
		breakpointsOpen: { default: false, type: "boolean" },
		viewmodelEditorOpen: { default: true, type: "boolean" },

		breakpoints: {
			Type: DefineList,
			default() {
				return [{
					key: "todos.length",
					parent: "TodoListVM{}"
				}]
			}
		},

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

		addBreakpoint(el) {
			this.breakpoints.push({
				key: el.value,
				parent: Reflect.getName( this.selectedElement.viewModel )
			});
			el.value = "";
		}
	},

	view: `
		<div class="grid-container">
			<div class="tree-view">
				<div class="component-tree-header">
					<h1>CanJS Components</h1>

					<div class="filters">
						<p><input placeholder="Filter Components"></p>
					</div>
				</div>
				<div class="component-tree">
					<components-tree-view
						tree:from="selectedElementsTree"
						selectNode:from="selectElementFromNode"
					></components-tree-view>
				</div>
			</div>

			<div class="sidebar {{# if(breakpointsOpen) }}breakpoints-open{{ else }}breakpoints-closed{{/ if }}">
				<div class="breakpoints">
					{{# if(breakpointsOpen) }}
						<h2>
							<div class="arrow-toggle down" on:click="this.breakpointsOpen = false">
							</div>
							Breakpoints
						</h2>

						<ul>
						{{# for(breakpoint of this.breakpoints) }}
							<li><input type="checkbox" checked>{{ breakpoint.parent }}.{{ breakpoint.key }}</li>
						{{/ for }}
						</ul>

						{{# if(this.selectedElement) }}
							<p><input placeholder="Add breakpoint" on:enter="addBreakpoint(scope.element)"></p>
						{{/ if }}
					{{ else }}
						<h2>
							<div class="arrow-toggle right" on:click="this.breakpointsOpen = true"></div>
							Breakpoints ({{ this.breakpoints.length }})
						</h2>
					{{/ if }}
				</div>

				<div class="viewmodel-editor">
					{{# if(viewmodelEditorOpen) }}
						<h2>
							<div class="arrow-toggle down" on:click="this.viewmodelEditorOpen = false">
							</div>
							ViewModel Editor
						</h2>

						<viewmodel-editor
							tagName:from="this.selectedElementTagName"
							viewModelData:from="this.selectedElementViewModelData"
							updateValues:from="this.updateSelectedElementViewModel" />

					{{ else }}
						<h2>
							<div class="arrow-toggle right" on:click="this.viewmodelEditorOpen = true"></div>
							ViewModel Editor
						</h2>
					{{/ if }}
				</div>
			</div>
		</div>
	`
});

export { Component };
