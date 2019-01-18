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
	});
});
