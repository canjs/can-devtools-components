import "steal-mocha";
import chai from "chai";
import Component from "./magic-input";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("magic-input", () => {
	it("edit() / save()", () => {
		const vm = new ViewModel();

		vm.edit();

		assert.ok(vm.editing, "edit() sets editing to true");

		vm.save("foo");
		assert.notOk(vm.editing, "save() sets editing to false");
		assert.equal(vm.value, "foo", "save() sets value");
	});

	it("showOptions", () => {
		const vm = new ViewModel();

		assert.notOk(vm.showOptions, "showOptions defaults to false");

		vm.editing = true;
		assert.notOk(vm.showOptions, "showOptions === false when editing === true without options");

		vm.options = [ "one" ];
		assert.ok(vm.showOptions, "showOptions === true when editing === true with options");

		vm.editing = false;
		assert.notOk(vm.showOptions, "showOptions === false when editing === false with options");
	});
});
