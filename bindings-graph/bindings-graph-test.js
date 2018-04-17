import "steal-mocha";
import chai from "chai";
import Component from "./bindings-graph";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("bindings-graph", () => {
	it("Has message", () => {
		const vm = new ViewModel();
		assert.equal(vm.message, "This is the bindings-graph component");
	});
});
