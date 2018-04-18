import "steal-mocha";
import chai from "chai";
import Component from "./bindings-graph";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("bindings-graph", () => {
	it("selectedKey defaults to first availableKey", () => {
		const vm = new ViewModel();

		// set up bindings
		vm.on("selectedKey", () => {});

		assert.ok(!vm.selectedKey, "selectedKey defaults to undefined");

		vm.availableKeys.replace([ "one", "two", "three" ]);

		assert.equal(vm.selectedKey, "one", "selectedKey defaults to availableKeys[0]");

		vm.selectedKey = "four";

		assert.equal(vm.selectedKey, "four", "selectedKey can be changed to a value not in availableKeys");

		vm.availableKeys.replace([ "five", "six", "seven" ]);

		assert.equal(vm.selectedKey, "five", "selectedKey defaults to availableKeys[0] even if it was already set");

		vm.availableKeys.replace([]);

		assert.notOk(vm.selectedKey, "selectedKey should be removed if there are no available keys");
	});
});
