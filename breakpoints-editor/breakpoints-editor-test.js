import Component from "./breakpoints-editor";
import "steal-mocha";
import chai from "chai";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("breakpoints-editor", () => {
	it("newBreakpointKey", () => {
		const vm = new ViewModel();
		vm.listenTo("newBreakpointKey", () => {});

		vm.newBreakpointKey = "todos.length";
		assert.equal(vm.newBreakpointKey, "todos.length", "can be set");

		vm.breakpoints = [ "todos.length" ];
		assert.equal(vm.newBreakpointKey, "", "resets when breakpoints changes");
	});
});
