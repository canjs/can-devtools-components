import { assert } from "chai";
import { diff, Reflect } from "can";
import ViewModelEditor from "./viewmodel-editor";

import "steal-mocha";

const noop = () => {};

describe("viewmodel-editor", () => {
	it("json", () => {
		const vm = new ViewModelEditor().initialize({
			viewModelData: {
				abc: "xyz",
				def: "uvw",
				ghi: []
			}
		});
		vm.listenTo("json", noop);

		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "xyz", def: "uvw", ghi: [] },
			"defaults to viewModelData"
		);

		vm.viewModelData = { abc: "rst", def: "uvw" };
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "rst", def: "uvw" },
			"updates when viewModelData is updated"
		);

		vm.json.def = "nop";
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "rst", def: "nop" },
			"updates when change is made by json-editor"
		);

		vm.viewModelData = { abc: "klm", def: "uvw", ghi: [] };
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "klm", def: "nop", ghi: [] },
			"persists change made by json-editor after viewModelData is set"
		);

		vm.viewModelData = { abc: "hij", def: "uvw", ghi: [] };
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "hij", def: "nop", ghi: [] },
			"persists change made by json-editor after viewModelData is set twice"
		);

		vm.json.ghi.push("rst");
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "hij", def: "nop", ghi: ["rst"] },
			"updates when another change is made by json-editor"
		);

		vm.viewModelData = { abc: "hij", def: "uvw", ghi: [] };
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "hij", def: "nop", ghi: ["rst"] },
			"persists changes made by json-editor after viewModelData is set"
		);

		vm.undefineds = ["jkl"];
		assert.equal(
			Reflect.hasOwnKey(vm.json, "jkl"),
			true,
			"sets keys in `undefineds` in json"
		);
		assert.equal(
			vm.json.jkl,
			undefined,
			"sets keys in `undefineds` as `undefined` in json"
		);

		vm.json.jkl = "ace";
		assert.equal(vm.json.jkl, "ace", "`undefined` properties can be set");

		vm.undefineds = ["jkl"];
		assert.equal(
			vm.json.jkl,
			"ace",
			"`undefined` properties that are set don't reset to `undefined`"
		);

		vm.jsonEditorPatches = [];
		vm.viewModelData = { abc: "hij", def: "nop", ghi: ["rst"] };
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "hij", def: "nop", ghi: ["rst"] },
			"updates when viewModelData is updated again after patches are reset"
		);

		vm.jsonEditorPatches = [
			{ type: "set", key: "abc", value: "klm" }
		];
		assert.deepEqual(
			vm.json.serialize(),
			{ abc: "klm", def: "nop", ghi: ["rst"] },
			"updates when patches are set"
		);

		vm.assign({
			tagName: "foo",
			viewModelData: {}
		});
		assert.deepEqual(vm.json.serialize(), {}, "resets when tagName changes");
	});

	it("jsonEditorPatches", () => {
		const vm = new ViewModelEditor().initialize({
			viewModelData: {
				abc: "xyz",
				def: "uvw",
				ghi: []
			},
			tagName: "tagName"
		});
		vm.listenTo("jsonEditorPatches", noop);

		assert.deepEqual(vm.jsonEditorPatches.get(), [], "patches are initially empty");

		const patch = { type: "set", key: "abc", value: "jkl" };
		vm.jsonEditorPatches.push(patch);
		assert.deepEqual(vm.jsonEditorPatches.get(), [patch], "patches are settable");

		vm.tagName = "differentTagName";
		assert.deepEqual(vm.jsonEditorPatches.get(), [], "patches are empty after tagName change");

		vm.jsonEditorPatches.push(patch);
		vm.viewModelData = {
			abc: "mnopq"
		};
		assert.deepEqual(vm.json.get(), { abc: "jkl" }, "patches are unchanged by change in vm data");
	})

	describe("getPatchedData", () => {
		let vm;

		beforeEach(() => {
			vm = new ViewModelEditor();
		});

		describe("add", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = {};
				let newSource = { eee: "fff" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "fff" };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: {} };
				let newSource = { nested: { eee: "fff" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "fff" } };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});
		});

		describe("set", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { eee: "fff" };
				let newSource = { eee: "ggg" };
				let expected = { aaa: "bbb", ccc: "ddd", eee: "ggg" };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { eee: "fff" } };
				let newSource = { nested: { eee: "ggg" } };
				let expected = { nested: { aaa: "bbb", ccc: "ddd", eee: "ggg" } };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});
		});

		describe("delete", () => {
			it("works", () => {
				let destination = { aaa: "bbb", ccc: "ddd" };
				let oldSource = { aaa: "bbb", ccc: "ddd" };
				let newSource = { aaa: "bbb" };
				let expected = { aaa: "bbb" };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});

			it("works with nested objects", () => {
				let destination = { nested: { aaa: "bbb", ccc: "ddd" } };
				let oldSource = { nested: { aaa: "bbb", ccc: "ddd" } };
				let newSource = { nested: { aaa: "bbb" } };
				let expected = { nested: { aaa: "bbb" } };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});
		});

		describe("splice", () => {
			it("works", () => {
				let destination = { list: ["one", "two"] };
				let oldSource = { list: ["one", "two"] };
				let newSource = { list: ["one", "three"] };
				let expected = { list: ["one", "three"] };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});

			it("works for nested arrays", () => {
				let destination = { nested: { list: ["one", "two"] } };
				let oldSource = { nested: { list: ["one", "two"] } };
				let newSource = { nested: { list: ["one", "three"] } };
				let expected = { nested: { list: ["one", "three"] } };
				let actual = vm.getPatchedData(
					destination,
					diff.deep(oldSource, newSource)
				);

				assert.deepEqual(actual, expected);
			});
		});
	});

	it("save", done => {
		const patches = [
			{
				key: "foo",
				type: "set",
				value: "baz"
			},
			{
				index: 0,
				deleteCount: 1,
				insert: [],
				type: "splice",
				key: "list"
			}
		];
		const vm = new ViewModelEditor().initialize({
			jsonEditorPatches: patches,
			updateValues(p) {
				assert.deepEqual(
					p,
					patches,
					"updateValues called with jsonEditorPatches"
				);
				done();
			}
		});

		vm.save();
	});

	it("reset", () => {
		const patches = [
			{
				key: "foo",
				type: "set",
				value: "baz"
			}
		];
		const vm = new ViewModelEditor().initialize({
			updateValues() {
				assert.ok(
					false,
					"updateValues called (should not be)"
				);
			},
			viewModelData: {
				abc: "xyz",
				def: "uvw",
				ghi: [],
				foo: null
			}
		});
		vm.listenTo("jsonEditorPatches", noop);
		const json = vm.json.serialize();
		vm.json.foo = "baz"; // sets patches

		assert.deepEqual(vm.getPatchedData(json, vm.jsonEditorPatches), vm.json.serialize(), "json patches");
		assert.deepEqual(vm.jsonEditorPatches, patches, "json patches");

		vm.reset();

		assert.deepEqual(vm.json, json);
		assert.deepEqual(vm.jsonEditorPatches, []);

	});
});
