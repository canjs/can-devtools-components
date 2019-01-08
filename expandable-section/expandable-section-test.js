import "steal-mocha";
import chai from "chai";
import Component from "./expandable-section";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("expandable-section", () => {
	it("expanded", () => {
		let vm = new ViewModel();
		vm.listenTo("expanded", () => {});

		assert.equal(vm.expanded, false, "defaults to false");

		vm.expanded = true;

		assert.equal(vm.expanded, true, "can be set to true");

		vm.expanded = false;

		assert.equal(vm.expanded, false, "can be set to false");

		vm.collapsible = false;

		assert.equal(vm.expanded, true, "setting collapsible to false sets expanded to true");

		vm.expanded = false;

		assert.equal(vm.expanded, true, "cannot set expanded if collapsible is false");

		vm = new ViewModel({ collapsible: false });
		assert.equal(vm.expanded, true, "when collapsible is defaulted to false, expanded defaults to true");
	});

	it("collapsible", () => {
		const vm = new ViewModel();

		assert.equal(vm.collapsible, true, "collapsible === true");
	});

});
