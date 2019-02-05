import Component from "./component-tree";
import "steal-mocha";
import chai from "chai";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("component-tree", () => {
	it("selectedNode", () => {
		const vm = new ViewModel();
		vm.listenTo("selectedNode", () => {});

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 0,
			children: [{
				selected: true,
				tagName: "todo-item",
				id: 1,
				children: []
			},{
				selected: false,
				tagName: "todo-editor",
				id: 2,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 3,
				children: []
			}]
		}]);

		assert.equal(vm.selectedNode, vm.componentTree[0].children[0], "selectedNode defaults to node with `selected: true`");

		// select node with `id === 3`
		vm.selectedNode = vm.componentTree[0].children[2];
		assert.equal(vm.selectedNode, vm.componentTree[0].children[2], "selectedNode set");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 0,
			children: [{
				selected: false,
				tagName: "todo-editor",
				id: 4,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 5,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 3,
				children: []
			}]
		}]);

		assert.equal(vm.selectedNode, vm.componentTree[0].children[2], "selectedNode persists after tree is updated");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 0,
			children: [{
				selected: false,
				tagName: "todo-editor",
				id: 4,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 5,
				children: []
			}]
		}]);
		assert.equal(vm.selectedNode, undefined, "selectedNode is cleared if selected node is removed from tree");

		vm.selectedNode = vm.componentTree[0].children[2];
		assert.equal(vm.selectedNode, vm.componentTree[0].children[2], "selectedNode set again");

		vm.componentTree.updateDeep([]);
		assert.equal(vm.selectedNode, undefined, "selectedNode is cleared if tree is cleared");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 6,
			children: []
		}]);

		vm.selectedNode = vm.componentTree[0];
		assert.equal(vm.selectedNode, vm.componentTree[0], "selectedNode set to only node");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "other-list",
			id: 7,
			children: []
		}]);

		assert.equal(vm.selectedNode, undefined, "selectedNode is cleared if only node is replaced");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 8,
			children: [{
				selected: true,
				tagName: "todo-item",
				id: 9,
				children: []
			},{
				selected: false,
				tagName: "todo-editor",
				id: 10,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 11,
				children: []
			}]
		}]);

		assert.equal(vm.selectedNode, vm.componentTree[0].children[0], "selectedNode set again to node with `selected: true`");

		vm.componentTree.updateDeep([{
			selected: false,
			tagName: "todo-list",
			id: 8,
			children: [{
				selected: false,
				tagName: "todo-item",
				id: 12,
				children: []
			},{
				selected: false,
				tagName: "todo-editor",
				id: 10,
				children: []
			},{
				selected: false,
				tagName: "todo-item",
				id: 11,
				children: []
			}]
		}]);

		assert.equal(vm.selectedNode, undefined, "selectedNode is cleared if selectedNode is replaced");
	});
});
