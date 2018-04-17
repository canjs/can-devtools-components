import "steal-mocha";
import chai from "chai";
import Component from "./bindings-graph";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("bindings-graph", () => {
	it("VM", () => {
		const vm = new ViewModel();
		assert.equal(typeof vm, "object");
	});
});
