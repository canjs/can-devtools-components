import "steal-mocha";
import { assert } from "chai";
import BindingsGraph from "./bindings-graph";

describe("bindings-graph", () => {
	let vm;
	beforeEach(function(){
		vm = new BindingsGraph();
		vm.initialize();

		// set up bindings
		vm.on("selectedKey", () => {});
	});

	afterEach(function(){
		vm = undefined;
	});

	it("selectedKey defaults to first availableKey", () => {
		assert.ok(!vm.selectedKey, "selectedKey defaults to undefined");

		vm.availableKeys.update(["one", "two", "three"]);
		assert.equal(
			vm.selectedKey,
			"one",
			"selectedKey defaults to availableKeys[0]"
		);

		vm.selectedKey = "four";
		assert.equal(
			vm.selectedKey,
			"four",
			"selectedKey can be changed to a value not in availableKeys"
		);

		vm.availableKeys.update(["five", "six", "seven"]);
		assert.equal(
			vm.selectedKey,
			"five",
			"selectedKey defaults to availableKeys[0] even if it was already set"
		);

		vm.availableKeys.update([]);
		assert.notOk(
			vm.selectedKey,
			"selectedKey should be removed if there are no available keys"
		);
	});

	it("doesn’t update selectedKey when availableKeys changes if selectedKey is already set", () => {
		vm.selectedKey = "two";
		vm.availableKeys.update(["one", "two", "three"]);
		assert.equal(
			vm.selectedKey,
			"two",
			"selectedKey is not set to availableKeys[0]"
		);
	});

	it("Resets selectedKey if availableKeys changes to a new array that does not contain the selectedKey", () => {
		vm.availableKeys.update(["one", "two", "three"]);
		vm.availableKeys.update(["four", "five", "six"]);
		assert.equal(
			vm.selectedKey,
			"four",
			"Setting selectedKey to availableKeys[0] when availableKeys changes"
		);
	});
});
