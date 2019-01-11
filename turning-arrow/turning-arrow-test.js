import "steal-mocha";
import chai from "chai";
import Component from "./turning-arrow";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("turning-arrow", () => {
	it("animate", () => {
		const vm = new ViewModel();
		vm.listenTo("animate", () => {});

		assert.equal(vm.animate, false, "defaults to false");

		vm.down = true;
		assert.equal(vm.animate, true, "changes to true first time vm.down changes");
	});
});
