import { Component, DefineList, DefineMap, stache, value } from "can";

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
				listenTo(lastSet, resolve);

				// recursively find a node in a tree that has `selected: true`
				const findSelectedNode = (list) => {
					let selectedNode;

					list.some((node) => {
						if (node.selected) {
							selectedNode = node;
							return true;
						}
						selectedNode = findSelectedNode(node.children);
					});

					return selectedNode;
				};

				// create an observable that represents the `selected: true` node
				const selectedComponentTreeNode = value.returnedBy(() =>
					findSelectedNode(this.componentTree)
				);

				// when a new node has `selected: true`, resolve selectedNode
				listenTo(selectedComponentTreeNode, (node) => {
					if (node) {
						resolve(node);
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
		{{/ for }}
	`
});

export { Component, DefineList, DefineMap, stache };
