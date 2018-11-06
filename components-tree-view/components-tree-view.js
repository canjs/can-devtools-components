import { Component, stache, DefineList } from "can";
import "components-tree-view/components-tree-view.less";

stache.addHelper("plusOne", (num) => num + 1);
stache.addHelper("makeTreeNode", (node, level) => ({ node, level }));

Component.extend({
	tag: "components-tree-view",

	ViewModel: {
		tree: { Type: DefineList, Default: DefineList },

		selectNode: {
			default() {
				return (path) => {
					console.log(path, "selected in tree");
				};
			}
		}
	},

	view: `
		{{< treeNodeTemplate }}
			{{# unless(node.children.length) }}
				<p class="tag level-{{level}}" on:click="scope.vm.selectNode(node)">
					<span>&#x3C;</span>{{ node.tagName }}<span>/&#x3E;</span>
				</p>
			{{ else }}
				<p class="tag level-{{level}}" on:click="scope.vm.selectNode(node)">
					<span>&#x3C;</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>

				{{# for(child of node.children) }}
					{{ let treeNode = makeTreeNode( child, plusOne(level) ) }}
					{{> treeNodeTemplate treeNode }}
				{{/ for }}

				<p class="tag level-{{level}}">
					<span>&#x3C;/</span>{{ node.tagName }}<span>&#x3E;</span>
				</p>
			{{/ unless }}
		{{/ treeNodeTemplate }}

		{{# for(node of tree) }}
			{{ let treeNode = makeTreeNode(node, 0) }}
			{{> treeNodeTemplate treeNode }}
		{{/ for }}
  `,
});

export { Component, stache, DefineList };
