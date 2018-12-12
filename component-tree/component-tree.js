import { Component, DefineList, DefineMap, stache } from "can";

import "component-tree/component-tree.less";

stache.addHelper("plusOne", (num) => num + 1);
stache.addHelper("makeTreeNode", (node, level) => ({ node, level }));

const ComponentTreeNode = DefineMap.extend("ComponentTreeNode", {
	tagName: "string",
	children: {
		type(newVal) {
			return new ComponentTreeList(newVal);
		}
	}
});

const ComponentTreeList = DefineList.extend("ComponentTreeList", {
	"#": ComponentTreeNode
});

export default Component.extend({
	tag: "component-tree",
	ViewModel: {
		componentTree: ComponentTreeList,
		selectedNode: DefineMap
	},
	view: `
		{{< treeNodeTemplate }}
			{{# unless(node.children.length) }}
				<p class="tag level-{{level}}{{# eq(scope.vm.selectedNode, node) }} selected{{/ eq }}" on:click="scope.vm.selectedNode = node">
					<span>&#x3C;</span>{{ node.tagName }}<span>/&#x3E;</span>
				</p>
			{{ else }}
				<p class="tag level-{{level}}{{# eq(scope.vm.selectedNode, node) }} selected{{/ eq }}" on:click="scope.vm.selectedNode = node">
					<span>&#x3C;</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>
				{{# for(child of node.children) }}
					{{ let treeNode = makeTreeNode( child, plusOne(level) ) }}
					{{> treeNodeTemplate treeNode }}
				{{/ for }}
				<p class="tag level-{{level}}{{# eq(scope.vm.selectedNode, node) }} selected{{/ eq }}" on:click="scope.vm.selectedNode = node">
					<span>&#x3C;/</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>
			{{/ unless }}
		{{/ treeNodeTemplate }}

		{{# for(node of componentTree) }}
			{{ let treeNode = makeTreeNode(node, 0) }}
			{{> treeNodeTemplate treeNode }}
		{{/ for }}
	`
});

export { Component, DefineList, DefineMap, stache };
