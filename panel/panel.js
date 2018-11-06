import { Component, Symbol, Reflect } from "can";

import "panel/panel.less";
import "viewmodel-editor/viewmodel-editor";
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
			default: null
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
		}
	},

	view: `
		<div class="grid-container">
			<div class="header">
				<p>CanJS Components</p>
			</div>

			<div class="search">
				<input placeholder="Filter Components">
			</div>

			<div class="space"></div>

			<div class="tabs">
				<p class="selected">VM</p>
				<p>Bindings</p>
				<p class="last">Log</p>
			</div>

			<div class="content">
				<components-tree-view
					tree:from="selectedElementsTree"
					selectNode:from="selectElementFromNode"
				></components-tree-view>
			</div>

			<div class="sidebar">
				<viewmodel-editor
					showHeading:from="false"
					tagName:from="selectedElementTagName"
					viewModelData:from="selectedElementViewModelData"
					updateValues:from="updateSelectedElementViewModel"
				></viewmodel-editor>
			</div>
		</div>
	`
});

export { Component };
