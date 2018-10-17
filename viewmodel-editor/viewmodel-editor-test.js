import { DefineMap, Reflect } from "can";
import Component from "./viewmodel-editor";
import "steal-mocha";
import chai from "chai";

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
		describe("add", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = {};
				let newSource = { eee: "fff" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "fff" };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: {} };
				let newSource = { nested: { eee: "fff" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "fff" } };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});
		});

		describe("set", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { eee: "fff" };
				let newSource = { eee: "ggg" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "ggg" };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { eee: "fff"} };
				let newSource = { nested: { eee: "ggg" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "ggg" } };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});
		});

		describe("delete", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { aaa: "bbb", ccc: "ddd" };
				let newSource = { aaa: "bbb" };
				let expected = { aaa: "bbb" };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { aaa: "bbb", ccc: "ddd" } };
				let newSource = { nested: { aaa: "bbb" } };
				let expected = { nested: { aaa: "bbb" } };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});
		});


		describe("splice", () => {
			it("works", () => {
				let destination = { list: [ "one", "two" ] };
				let oldSource = { list: [ "one", "two" ] };
				let newSource = { list: [ "one", "three" ] };
				let expected = { list: [ "one", "three" ] };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});

			it("works for nested arrays", () => {
				let destination = { nested: { list: [ "one", "two" ] } };
				let oldSource = { nested: { list: [ "one", "two" ] } };
				let newSource = { nested: { list: [ "one", "three" ] } };
				let expected = { nested: { list: [ "one", "three" ] } };
				let actual = vm.getPatchedData(destination, oldSource, newSource);

				assert.deepEqual(actual, expected);
			});
		});
	});

	it("saving", () => {
		Reflect.onKeyValue(vm, "saving", () => {});

		assert.equal(vm.saving, false, "false by default");

		vm.updatesPaused = true;
		assert.equal(vm.saving, false, "false while updates are paused");

		vm.updatesPaused = false;
		assert.equal(vm.saving, true, "true when updates are resumed");

		vm.viewModelData = {};
		assert.equal(vm.saving, false, "false once next update is received");
	});
});
