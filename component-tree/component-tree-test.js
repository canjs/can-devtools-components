import Component from "./component-tree";
import "steal-mocha";
import chai from "chai";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("component-tree", () => {
	it("selectedNode", () => {
		const vm = new ViewModel();

		vm.componentTree.updateDeep([{
			tagName: "todo-list",
			id: 0,
			children: [{
				tagName: "todo-item",
				id: 1,
				children: []
			},{
				tagName: "todo-editor",
				id: 2,
				children: []
			},{
				tagName: "todo-item",
				id: 3,
				children: []
			}]
		}]);

		// select node with `id === 3`
		vm.selectedNode = vm.componentTree[0].children[2];
		assert.equal(vm.selectedNode, vm.componentTree[0].children[2], "selectedNode set");

		vm.componentTree.updateDeep([{
			tagName: "todo-list",
			id: 0,
			children: [{
				tagName: "todo-editor",
				id: 4,
				children: []
			},{
				tagName: "todo-item",
				id: 5,
				children: []
			},{
				tagName: "todo-item",
				id: 3,
				children: []
			}]
		}]);

		assert.equal(vm.selectedNode, vm.componentTree[0].children[2], "selectedNode persists after tree is updated");
	});
});
