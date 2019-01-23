import { diff, Reflect } from "can";
import Component from "./viewmodel-editor";
import "steal-mocha";
import chai from "chai";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

const noop = () => {};

describe("viewmodel-editor", () => {
	it("json", () => {
		const vm = new ViewModel({
			viewModelData: {
				abc: "xyz",
				def: "uvw",
				ghi: []
			}
		});
		vm.listenTo("json", noop);

		assert.deepEqual(vm.json.serialize(), { abc: "xyz", def: "uvw", ghi: [] }, "defaults to viewModelData");

		vm.viewModelData = { abc: "rst", def: "uvw" };
		assert.deepEqual(vm.json.serialize(), { abc: "rst", def: "uvw" }, "updates when viewModelData is updated");

		vm.json.def = "nop";
		assert.deepEqual(vm.json.serialize(), { abc: "rst", def: "nop" }, "updates when change is made by json-editor");

		vm.viewModelData = { abc: "klm", def: "uvw", ghi: [] };
		assert.deepEqual(vm.json.serialize(), { abc: "klm", def: "nop", ghi: [] }, "persists change made by json-editor after viewModelData is set");

		vm.viewModelData = { abc: "hij", def: "uvw", ghi: [] };
		assert.deepEqual(vm.json.serialize(), { abc: "hij", def: "nop", ghi: [] }, "persists change made by json-editor after viewModelData is set twice");

		vm.json.ghi.push("rst");
		assert.deepEqual(vm.json.serialize(), { abc: "hij", def: "nop", ghi: [ "rst" ] }, "updates when another change is made by json-editor");

		vm.viewModelData = { abc: "hij", def: "uvw", ghi: [] };
		assert.deepEqual(vm.json.serialize(), { abc: "hij", def: "nop", ghi: [ "rst" ] }, "persists changes made by json-editor after viewModelData is set");

		vm.undefineds = [ "jkl" ];
		assert.equal(Reflect.hasOwnKey(vm.json, "jkl"), true, "sets keys in `undefineds` in json");
		assert.equal(vm.json.jkl, undefined, "sets keys in `undefineds` as `undefined` in json");

		vm.json.jkl = "ace";
		assert.equal(vm.json.jkl, "ace", "`undefined` properties can be set");

		vm.undefineds = [ "jkl" ];
		assert.equal(vm.json.jkl, "ace", "`undefined` properties that are set don't reset to `undefined`");

		vm.dispatch("reset-json-patches");
		vm.viewModelData = { abc: "hij", def: "nop", ghi: [ "rst" ] };
		assert.deepEqual(vm.json.serialize(), { abc: "hij", def: "nop", ghi: [ "rst" ] }, "updates when viewModelData is updated again after reset-json-patches event");

		vm.assign({
			tagName: "foo",
			viewModelData: {}
		});
		assert.deepEqual(vm.json.serialize(), { }, "resets when tagName changes");
	});

	describe("getPatchedData", () => {
		let vm;

		beforeEach(() => {
			vm = new ViewModel();
		});

		describe("add", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = {};
				let newSource = { eee: "fff" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "fff" };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: {} };
				let newSource = { nested: { eee: "fff" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "fff" } };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});
		});

		describe("set", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { eee: "fff" };
				let newSource = { eee: "ggg" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "ggg" };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { eee: "fff"} };
				let newSource = { nested: { eee: "ggg" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "ggg" } };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});
		});

		describe("delete", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { aaa: "bbb", ccc: "ddd" };
				let newSource = { aaa: "bbb" };
				let expected = { aaa: "bbb" };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { aaa: "bbb", ccc: "ddd" } };
				let newSource = { nested: { aaa: "bbb" } };
				let expected = { nested: { aaa: "bbb" } };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});
		});


		describe("splice", () => {
			it("works", () => {
				let destination = { list: [ "one", "two" ] };
				let oldSource = { list: [ "one", "two" ] };
				let newSource = { list: [ "one", "three" ] };
				let expected = { list: [ "one", "three" ] };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});

			it("works for nested arrays", () => {
				let destination = { nested: { list: [ "one", "two" ] } };
				let oldSource = { nested: { list: [ "one", "two" ] } };
				let newSource = { nested: { list: [ "one", "three" ] } };
				let expected = { nested: { list: [ "one", "three" ] } };
				let actual = vm.getPatchedData(destination, diff.deep(oldSource, newSource));

				assert.deepEqual(actual, expected);
			});
		});
	});

	it("save", (done) => {
		const patches = [{
			key: "foo", type: "set", value: "baz"
		},{
			index: 0, deleteCount: 1, insert: [], type: "splice", key: "list"
		}];
		const vm = new ViewModel({
			jsonEditorPatches: patches,
			updateValues(p) {
				assert.deepEqual(p, patches, "updateValues called with jsonEditorPatches");
			}
		});

		vm.listenTo("reset-json-patches", () => {
			assert.ok(true, "reset-json-patches event dispatched");
			done();
		});

		vm.save();
	});
});
