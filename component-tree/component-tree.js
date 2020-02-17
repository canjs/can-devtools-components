import {
	ObservableArray,
	ObservableObject,
	Reflect,
	stache,
	StacheElement,
	type,
	value
} from "can";

import "component-tree/component-tree.less";

stache.addHelper("plusOne", num => num + 1);

class ComponentTreeNode extends ObservableObject {
	static get props() {
		return {
			selected: Boolean,
			tagName: type.convert(String),
			id: { type: Number, identity: true },
			children: type.late(() => type.convert(ComponentTreeList)),
		};
	}
	filteredChildren(filterString) {
		const fc = this.children.filteredItems(filterString)
		if(!filterString) {
			return this.children;
		} else if(this.nodeMatchesFilter(filterString)) {
			return fc;
		} else {
			return fc.length > 0 ? fc : null;
		}
	}
	nodeMatchesFilter(filterString) {
		return !filterString || this.tagName.indexOf(filterString) > -1;
	}
}

/* jshint -W003 */
class ComponentTreeList extends ObservableArray {
	static get items() {
		return type.convert(ComponentTreeNode);
	}
	filteredItems(filterString) {
		return this.filter(child => child.filteredChildren(filterString));
	}
}
/* jshint +W003 */

export default class ComponentTree extends StacheElement {
	static get view() {
		return `
			{{< treeNodeTemplate }}
				{{# unless(node.children.length) }}
					<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
						<span>&#x3C;</span>{{ node.tagName }}<span>/&#x3E;</span>
					</p>
				{{ else }}
					<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
						<span>&#x3C;</span>{{#if node.nodeMatchesFilter(tree.filterString)}}{{ node.tagName }}{{else}}<span>{{ node.tagName }}</span>{{/if}}<span>&#x3E;</span>
					</p>
					{{# for(child of node.children.filteredItems(tree.filterString)) }}
						{{ treeNodeTemplate(node=child level=plusOne(level) tree=tree) }}
					{{/ for }}
					<p class="tag level-{{level}}{{# eq(tree.selectedNode, node) }} selected{{/ eq }}" on:click="tree.selectedNode = node">
						<span>&#x3C;/</span>{{#if node.nodeMatchesFilter(tree.filterString)}}{{ node.tagName }}{{else}}<span>{{ node.tagName }}</span>{{/if}}<span>&#x3E;</span>
					</p>
				{{/ unless }}
			{{/ treeNodeTemplate }}

			{{# for(node of this.componentTree.filteredItems(this.filterString)) }}
				{{ treeNodeTemplate(node=node level=0 tree=this) }}
			{{/ else }}
				<h1 class="no-components">No Components Found</h1>
			{{/ for }}
		`;
	}

	static get props() {
		return {
			treeError: type.convert(String),

			componentTree: {
				type: type.maybeConvert(ComponentTreeList),

				get default() {
					return new ComponentTreeList();
				}
			},

			filterString: {
				type: String,
				default: ""
			},

			selectedNode: {
				value({ listenTo, lastSet, resolve }) {
					let selectedNode = resolve(lastSet.get());

					// if node is replaced by a node with a different id,
					// deselect it unless the node is still selected
					const resetOnIdChange = () => {
						if (selectedNode) {
							if (selectedNode.selected) {
								return;
							}
							Reflect.offKeyValue(selectedNode, "id", resetOnIdChange);
						}
						selectedNode = resolve(undefined);
					};

					const setSelectedNode = node => {
						if (selectedNode) {
							Reflect.offKeyValue(selectedNode, "id", resetOnIdChange);
						}

						selectedNode = resolve(node);

						if (selectedNode) {
							Reflect.onKeyValue(selectedNode, "id", resetOnIdChange);
						}
					};

					listenTo(lastSet, node => {
						setSelectedNode(node);
					});

					// recursively find a node in a tree that has `selected: true`
					const findNode = (list, filterFn) => {
						let foundNode;

						list.some(node => {
							if (filterFn(node)) {
								foundNode = node;
								return true;
							}
							foundNode = findNode(node.children, filterFn);
						});

						return foundNode;
					};

					// create an observable that represents the `selected: true` node
					const selectedComponentTreeNode = value.returnedBy(() => {
						return findNode(this.componentTree, node => {
							return node.selected;
						});
					});

					// when a new node has `selected: true`, resolve selectedNode
					listenTo(selectedComponentTreeNode, selectedComponentTreeNode => {
						if (selectedComponentTreeNode) {
							setSelectedNode(selectedComponentTreeNode);
						}
					});

					// create an observable that represents whether the selectedNode is in the tree
					const selectedNodeInTree = value.returnedBy(() => {
						return findNode(this.componentTree, node => {
							return selectedNode && node.id === selectedNode.id;
						});
					});

					// if the selectedNode is removed from the tree, reset
					listenTo(selectedNodeInTree, selectedNodeInTree => {
						if (selectedNode && !selectedNodeInTree) {
							setSelectedNode(undefined);
						}
					});
				}
			}
		};
	}
}

customElements.define("component-tree", ComponentTree);

export {
	StacheElement,
	ObservableArray,
	ObservableObject,
	stache,
	value,
	Reflect
};
