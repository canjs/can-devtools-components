import { Component, DefineList, DefineMap, stache } from "can";

import "component-tree/component-tree.less";

stache.addHelper("plusOne", (num) => num + 1);

let ComponentTreeList;

const ComponentTreeNode = DefineMap.extend("ComponentTreeNode", {
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
		selectedNode: DefineMap
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
