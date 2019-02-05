import { Component, DefineList, DefineMap, stache, value, Reflect } from "can";

import "component-tree/component-tree.less";

stache.addHelper("plusOne", (num) => num + 1);

let ComponentTreeList;

const ComponentTreeNode = DefineMap.extend("ComponentTreeNode", {
	selected: "boolean",
	tagName: "string",
	id: { type: "number", identity: true },
	children: {
		type(newVal) {
			return new ComponentTreeList(newVal);
		}
	}
});

ComponentTreeList = DefineList.extend("ComponentTreeList", {
	"#": ComponentTreeNode
});

export default Component.extend({
	tag: "component-tree",
	ViewModel: {
		componentTree: { Type: ComponentTreeList, Default: ComponentTreeList },
		selectedNode: {
			value({ listenTo, lastSet, resolve }) {
				let selectedNode = resolve(lastSet.get());

				listenTo(lastSet, (node) => {
					// tear down old listeners
					if (selectedNode) {
						Reflect.offKeyValue(selectedNode, "id");
					}

					selectedNode = resolve(node);

					if (selectedNode) {
						// if node is replaced by a node with a different id, deselect it
						Reflect.onKeyValue(selectedNode, "id", () => {
							selectedNode = resolve(undefined);
						});
					}
				});

				// recursively find a node in a tree that has `selected: true`
				const findNode = (list, filterFn) => {
					let foundNode;

					list.some((node) => {
						if (filterFn(node)) {
							foundNode = node;
							return true;
						}
						foundNode = findNode(node.children, filterFn);
					});

					return foundNode;
				};

				// create an observable that represents the `selected: true` node
				const selectedComponentTreeNode = value.returnedBy(() =>
					findNode(this.componentTree, (node) => node.selected)
				);

				// when a new node has `selected: true`, resolve selectedNode
				listenTo(selectedComponentTreeNode, (node) => {
					if (node) {
						selectedNode = resolve(node);
					}
				});

				// create an observable that represents whether the selectedNode is in the tree
				const selectedNodeInTree = value.returnedBy(() =>
					findNode(this.componentTree, (node) => selectedNode && (node.id === selectedNode.id))
				);

				// if the selectedNode is removed from the tree, reset
				listenTo(selectedNodeInTree, (selectedNodeInTree) => {
					if (selectedNode && !selectedNodeInTree) {
						selectedNode = resolve(undefined);
					}
				});
			}
		},
		error: "string"
	},
	view: `
		{{< treeNodeTemplate }}
			{{# unless(node.children.length) }}
				<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
					<span>&#x3C;</span>{{ node.tagName }}<span>/&#x3E;</span>
				</p>
			{{ else }}
				<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
					<span>&#x3C;</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>
				{{# for(child of node.children) }}
					{{ treeNodeTemplate(node=child level=plusOne(level) tree=tree) }}
				{{/ for }}
				<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
					<span>&#x3C;/</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>
			{{/ unless }}
		{{/ treeNodeTemplate }}

		{{# for(node of componentTree) }}
			{{ treeNodeTemplate(node=node level=0 tree=this) }}
		{{/ else }}
			<h1 class="no-components">No Components Found</h1>
		{{/ for }}
	`
});

export { Component, DefineList, DefineMap, stache, value, Reflect };
