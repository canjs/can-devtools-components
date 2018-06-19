import "steal-mocha";
import chai from "chai";
import Component from "./viewmodel-editor";
import DefineMap from "can-define/map/map";
import canReflect from "can-reflect";

let ViewModel = Component.ViewModel;
let assert = chai.assert;

describe("viewmodel-editor", () => {
	let el, sourceVM, vm;

	beforeEach((done) => {
		sourceVM = new DefineMap({
			foo: "abc",
			bar: "xyz"
		});

		vm = new ViewModel({
			viewModelData: sourceVM.serialize(),
			tagName: "my-el"
		});

		el = document.createElement("viewmodel-editor");
		document.body.appendChild(el);

		setTimeout(() => {
			vm.connectedCallback(el);
			done();
		}, 50);
	});

	afterEach(() => {
		document.body.removeChild(el);
	});

	describe("json", () => {
		describe("when ONLY viewModelData is changing", () => {
			it("should be set to initial viewModelData", () => {
				assert.deepEqual(vm.json, sourceVM.serialize());
			});

			it("should be set to replaced viewModelData", () => {
				vm.viewModelData = { aaa: "bbb", ccc: "ddd" };
				assert.deepEqual(vm.json, { aaa: "bbb", ccc: "ddd" });
			});

			it("should be updated with updated viewModelData", () => {
				vm.viewModelData = { aaa: "bbb", ccc: "ddd" };
				vm.viewModelData.aaa = "zzz";
				assert.deepEqual(vm.json, { aaa: "zzz", ccc: "ddd" });
			});

			it("should NOT be updated with updated viewModelData when updatesPaused === true", () => {
				vm.viewModelData = { aaa: "bbb", ccc: "ddd" };
				vm.updatesPaused = true;
				vm.viewModelData.aaa = "yyy";
				assert.deepEqual(vm.json, { aaa: "bbb", ccc: "ddd" });
			});

			it("should be updated with updated viewModelData when updatesPaused is set to false", () => {
				vm.viewModelData = { aaa: "bbb", ccc: "ddd" };
				vm.updatesPaused = true;
				vm.viewModelData.aaa = "yyy";
				vm.updatesPaused = false;
				assert.deepEqual(vm.json, { aaa: "yyy", ccc: "ddd" });
			});
		});

		describe("when viewModel AND jsoneditor data are changing", () => {
			it("should merge changes made in jsoneditor with changes to viewModelData", () => {
				// initial viewModelData
				vm.viewModelData = { aaa: "yyy", ccc: "ddd" };

				// simulate change to data in JSON editor
				vm.json = { aaa: "yyy", ccc: "ddd" };
				vm.editor.get = function() { return { aaa: "yyy", ccc: "eee" }; };

				// pause updates
				vm.updatesPaused = true;
				// simulate change to viewModel data
				vm.viewModelData.aaa = "xxx";
				// unpause updates
				vm.updatesPaused = false;

				assert.deepEqual(vm.json, { aaa: "xxx", ccc: "eee" }, "should merge changes made in jsoneditor with changes to viewModelData");

				vm.viewModelData.aaa = "www";
				assert.deepEqual(vm.json, { aaa: "www", ccc: "eee" }, "should merge changes made to viewModelData into latest json in jsoneditor");
			});
		});
	});

	describe("getPatchedData", () => {
		it("should work for add", () => {
			let destination = { aaa: "bbb", ccc: "ddd" };
			let oldSource = {};
			let newSource = { eee: "fff" };
			let expected = { aaa: "bbb", ccc: "ddd", eee: "fff" };
			let actual = vm.getPatchedData(destination, oldSource, newSource);

			assert.deepEqual(actual, expected);
		});

		it("should work for set", () => {
			let destination = { aaa: "bbb", ccc: "ddd" };
			let oldSource = { eee: "fff" };
			let newSource = { eee: "ggg" };
			let expected = { aaa: "bbb", ccc: "ddd", eee: "ggg" };
			let actual = vm.getPatchedData(destination, oldSource, newSource);

			assert.deepEqual(actual, expected);
		});

		it("should work for delete", () => {
			let destination = { aaa: "bbb", ccc: "ddd" };
			let oldSource = { aaa: "bbb", ccc: "ddd" };
			let newSource = { aaa: "bbb" };
			let expected = { aaa: "bbb" };
			let actual = vm.getPatchedData(destination, oldSource, newSource);

			assert.deepEqual(actual, expected);
		});

		it("should work for splice", () => {
			let destination = { list: [ "one", "two" ] };
			let oldSource = { list: [ "one", "two" ] };
			let newSource = { list: [ "one", "three" ] };
			let expected = { list: [ "one", "three" ] };
			let actual = vm.getPatchedData(destination, oldSource, newSource);

			assert.deepEqual(actual, expected);
		});
	});

	it("saving", () => {
		canReflect.onKeyValue(vm, "saving", () => {});

		assert.equal(vm.saving, false, "false by default");

		vm.updatesPaused = true;
		assert.equal(vm.saving, false, "false while updates are paused");

		vm.updatesPaused = false;
		assert.equal(vm.saving, true, "true when updates are resumed");

		vm.viewModelData = {};
		assert.equal(vm.saving, false, "false once next update is received");
	});
});
