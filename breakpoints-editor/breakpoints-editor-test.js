import BreakpointsEditor from "./breakpoints-editor";
import { assert } from "chai";

import "steal-mocha";

describe("breakpoints-editor", () => {
	it("newBreakpointKey", () => {
		const vm = new BreakpointsEditor();
		vm.initialize();

		vm.listenTo("newBreakpointKey", () => {});
		vm.newBreakpointKey = "todos.length";
		assert.equal(vm.newBreakpointKey, "todos.length", "can be set");

		vm.breakpoints = ["todos.length"];
		assert.equal(vm.newBreakpointKey, "", "resets when breakpoints changes");
	});
});
