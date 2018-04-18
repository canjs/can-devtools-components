import "steal-mocha";
import chai from "chai";
import Component from "./queues-logstack";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("queues-logstack", () => {
	it("displayStack", () => {
		const vm = new ViewModel();

		vm.stack = [ "one", "two" ];

		assert.deepEqual(vm.displayStack.serialize(), [ "two", "one" ], "displayStack should reverse stack");
		assert.deepEqual(vm.stack.serialize(), [ "one", "two" ], "should not modify stack");
	});

	it("selecting a task", () => {
		const vm = new ViewModel({
			stack: [ "zero", "one", "two" ],
			inspectTask(index) {
				assert.equal(index, 0, "inspectTask should be called with correct index");
			}
		});

		// set up bindings
		vm.on("selectedTask", () => {});

		assert.equal(vm.selectedTask, vm.stack[2], "selectedTask should default to the last item");

		vm.selectTask(vm.stack[0]);

		assert.equal(vm.selectedTask, vm.stack[0], "should set selected task");

		vm.stack = [ "three", "four", "five" ];
		assert.equal(vm.selectedTask, vm.stack[2], "selectedTask should reset to the last item when stack changes");
	});
});
