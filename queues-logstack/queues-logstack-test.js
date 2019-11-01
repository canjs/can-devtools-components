import { assert } from "chai";
import QueuesLogStack from "./queues-logstack";

import "steal-mocha";

describe("queues-logstack", () => {
	it("displayStack", () => {
		const vm = new QueuesLogStack();
		vm.initialize();

		const stack = [
			{ functionName: "Thing{}.zero", metaReasonLog: "zero" },
			{ functionName: "Thing{}.one", metaReasonLog: "one" }
		];

		vm.stack = stack;

		assert.deepEqual(
			vm.displayStack.serialize(),
			[stack[1], stack[0]],
			"displayStack should reverse stack"
		);
		assert.deepEqual(
			vm.stack.serialize(),
			[stack[0], stack[1]],
			"should not modify stack"
		);
	});

	it("selectedTask", () => {
		const vm = new QueuesLogStack().initialize({
			stack: [
				{ functionName: "Thing{}.zero", metaReasonLog: "zero" },
				{ functionName: "Thing{}.one", metaReasonLog: "one" },
				{ functionName: "Thing{}.two", metaReasonLog: "two" }
			],
			inspectTask(index) {
				assert.equal(
					index,
					0,
					"inspectTask should be called with correct index"
				);
			}
		});

		vm.on("selectedTask", () => {});

		assert.equal(
			vm.selectedTask,
			vm.stack[2],
			"selectedTask should default to the last item"
		);

		vm.selectTask(vm.stack[0]);

		assert.equal(vm.selectedTask, vm.stack[0], "should set selected task");

		vm.stack = [
			{ functionName: "Thing{}.three", metaReasonLog: "three" },
			{ functionName: "Thing{}.four", metaReasonLog: "four" },
			{ functionName: "Thing{}.five", metaReasonLog: "five" }
		];
		assert.equal(
			vm.selectedTask,
			vm.stack[2],
			"selectedTask should reset to the last item when stack changes"
		);

		vm.stack = [
			{ functionName: "Thing{}.six", metaReasonLog: "six" },
			{ functionName: "Thing{}.seven", metaReasonLog: "seven" },
			{ functionName: "", metaReasonLog: "eight" }
		];

		assert.equal(
			vm.selectedTask,
			vm.stack[1],
			"selectedTask should be the last item with a function"
		);
	});
});
