import { assert } from "chai";
import {
	JSONTreeEditor,
	KeyValueEditor,
	removeTrailingBracketsOrBraces
} from "./json-tree-editor";

import "steal-mocha";

const noop = () => {};
const ev = { stopPropagation: noop };

describe("JSONTreeEditor - ViewModel", () => {
	it("connected hook", done => {
		const el = new JSONTreeEditor();
		el.connect();

		el.listenTo("hide-all-key-value-editors", () => {
			assert.ok(true, "hide-all-key-value-editors dispatched");
			done();
		});

		window.dispatchEvent(new Event("click"));
	});

	it("expandedKeys", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("expandedKeys", noop);

		assert.deepEqual(
			el.expandedKeys.serialize(),
			[],
			"nothing expanded by default"
		);

		el.dispatch("toggle-expanded", ["foo"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["foo"],
			"dispatching a toggle-expanded event expands a key"
		);

		el.dispatch("toggle-expanded", ["bar"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["foo", "bar"],
			"dispatching two toggle-expanded event expands both keys"
		);

		el.dispatch("toggle-expanded", ["foo"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["bar"],
			"dispatching a toggle-expanded event collapses a key"
		);

		el.dispatch("toggle-expanded", ["bar"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			[],
			"dispatching a toggle-expanded event collapses a second key"
		);

		el.listenTo("json", noop);
		el.json = { arr: [] };

		el.dispatch("add-child", ["arr"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["arr", "arr.0"],
			"dispatching an add-child event for a path containing an array expands the array and its first child"
		);

		el.dispatch("add-child", ["arr"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["arr", "arr.0"],
			"dispatching a second add-child event for a path containing an array does nothing"
		);

		el.dispatch("delete-json-path", ["arr.0"]);
		assert.deepEqual(
			el.expandedKeys.serialize(),
			["arr"],
			"dispatching a delete-json-path event removes that path from expandedKeys"
		);
	});

	it("json", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("json", noop);

		assert.deepEqual(el.json.serialize(), {}, "defaults to empty object");

		el.json = { foo: "bar" };
		assert.deepEqual(el.json.serialize(), { foo: "bar" }, "can be set");

		el.dispatch("set-json", [{ abc: "def", ghi: { jkl: "mno" }, pqr: [] }]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "def", ghi: { jkl: "mno" }, pqr: [] },
			"can be set by dispatching a set-json event"
		);

		el.dispatch("set-json-path-value", ["abc", "onetwothree"]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "onetwothree", ghi: { jkl: "mno" }, pqr: [] },
			"can set a property by dispatching a set-json-path-value event"
		);

		el.dispatch("set-json-path-value", ["ghi.jkl", "fourfivesix"]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "onetwothree", ghi: { jkl: "fourfivesix" }, pqr: [] },
			"can set a nested property by dispatching a set-json-path-value event"
		);

		el.dispatch("delete-json-path", ["abc"]);
		assert.deepEqual(
			el.json.serialize(),
			{ ghi: { jkl: "fourfivesix" }, pqr: [] },
			"can delete a property by dispatching a delete-json-path event"
		);

		el.dispatch("delete-json-path", ["ghi.jkl"]);
		assert.deepEqual(
			el.json.serialize(),
			{ ghi: {}, pqr: [] },
			"can delete a nested property by dispatching a delete-json-path event"
		);

		el.dispatch("add-child", ["pqr"]);
		assert.deepEqual(
			el.json.serialize(),
			{ ghi: {}, pqr: [{}] },
			"dispatching an add-child event will add an empty object to an array"
		);

		el.dispatch("set-json-path-value", ["abc", "123"]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: 123, ghi: {}, pqr: [{}] },
			"can set a non-string property by dispatching a set-json-path-value event"
		);

		el.dispatch("set-json-path-value", ["abc", '"onetwothree"']);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "onetwothree", ghi: {}, pqr: [{}] },
			"can set a property as a string by dispatching a set-json-path-value event with the value wrapped in double quotes"
		);

		el.dispatch("set-json-path-value", ["abc", "'fourfivesix'"]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "fourfivesix", ghi: {}, pqr: [{}] },
			"can set a property as a string by dispatching a set-json-path-value event with the value wrapped in single quotes"
		);

		el.dispatch("set-json-path-value", ["abc", '"123"']);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "123", ghi: {}, pqr: [{}] },
			"can set a non-string property as a string by dispatching a set-json-path-value event with the value wrapped in double quotes"
		);

		el.dispatch("set-json-path-value", ["abc", "'456'"]);
		assert.deepEqual(
			el.json.serialize(),
			{ abc: "456", ghi: {}, pqr: [{}] },
			"can set a non-string property as a string by dispatching a set-json-path-value event with the value wrapped in single quotes"
		);
	});

	it("parsedJSON", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("parsedJSON", noop);

		const testCases = [
			{
				json: {},
				output: [],
				name: "empty object"
			},
			{
				json: {
					name: "Kevin",
					age: 30,
					likesPizza: true,
					aNull: null
				},
				output: [
					{
						key: "name",
						path: "name",
						type: "String",
						value: "Kevin"
					},
					{
						key: "age",
						path: "age",
						type: "Number",
						value: 30
					},
					{
						key: "likesPizza",
						path: "likesPizza",
						type: "Boolean",
						value: true
					},
					{
						key: "aNull",
						path: "aNull",
						type: "Null",
						value: null
					}
				],
				name: "simple object"
			},
			{
				json: {
					name: {
						first: "Connor",
						last: "Phillips"
					}
				},
				output: [
					{
						key: "name",
						path: "name",
						type: "Object",
						value: [
							{
								key: "first",
								path: "name.first",
								type: "String",
								value: "Connor"
							},
							{
								key: "last",
								path: "name.last",
								type: "String",
								value: "Phillips"
							}
						]
					}
				],
				name: "object in object"
			},
			{
				json: {
					hobbies: ["singing", "dancing", "soccer"]
				},
				output: [
					{
						key: "hobbies",
						path: "hobbies",
						type: "Array",
						value: [
							{
								key: 0,
								path: "hobbies.0",
								type: "String",
								value: "singing"
							},
							{
								key: 1,
								path: "hobbies.1",
								type: "String",
								value: "dancing"
							},
							{
								key: 2,
								path: "hobbies.2",
								type: "String",
								value: "soccer"
							}
						]
					}
				],
				name: "array in object"
			},
			{
				json: {
					person: {
						hobbies: ["singing", "dancing", "soccer"]
					}
				},
				output: [
					{
						key: "person",
						path: "person",
						type: "Object",
						value: [
							{
								key: "hobbies",
								path: "person.hobbies",
								type: "Array",
								value: [
									{
										key: 0,
										path: "person.hobbies.0",
										type: "String",
										value: "singing"
									},
									{
										key: 1,
										path: "person.hobbies.1",
										type: "String",
										value: "dancing"
									},
									{
										key: 2,
										path: "person.hobbies.2",
										type: "String",
										value: "soccer"
									}
								]
							}
						]
					}
				],
				name: "array in object in object"
			},
			{
				json: {
					hobbies: [
						{ name: "singing" },
						{ name: "dancing" },
						{ name: "soccer" }
					]
				},
				output: [
					{
						key: "hobbies",
						path: "hobbies",
						type: "Array",
						value: [
							{
								key: 0,
								path: "hobbies.0",
								type: "Object",
								value: [
									{
										key: "name",
										path: "hobbies.0.name",
										type: "String",
										value: "singing"
									}
								]
							},
							{
								key: 1,
								path: "hobbies.1",
								type: "Object",
								value: [
									{
										key: "name",
										path: "hobbies.1.name",
										type: "String",
										value: "dancing"
									}
								]
							},
							{
								key: 2,
								path: "hobbies.2",
								type: "Object",
								value: [
									{
										key: "name",
										path: "hobbies.2.name",
										type: "String",
										value: "soccer"
									}
								]
							}
						]
					}
				],
				name: "array of objects"
			},
			{
				json: {
					hobbies: [{}, { name: "dancing" }]
				},
				output: [
					{
						key: "hobbies",
						path: "hobbies",
						type: "Array",
						value: [
							{
								key: 0,
								path: "hobbies.0",
								type: "Object",
								value: []
							},
							{
								key: 1,
								path: "hobbies.1",
								type: "Object",
								value: [
									{
										key: "name",
										path: "hobbies.1.name",
										type: "String",
										value: "dancing"
									}
								]
							}
						]
					}
				],
				name: "array with empty object"
			}
		];

		testCases.forEach(({ json, output, name }) => {
			el.assign({
				json: json
			});
			assert.deepEqual(
				el.parsedJSON.serialize(),
				output,
				`works for ${name}`
			);
		});
	});

	it("displayedKeyValueEditors", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("displayedKeyValueEditors", noop);

		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			[],
			"nothing displayed by default"
		);

		el.dispatch("display-key-value-editor", ["obj"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			["obj"],
			"dispatching display-key-value-editor event displays key-value editor"
		);

		el.dispatch("display-key-value-editor", ["obj"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			["obj"],
			"dispatching display-key-value-editor event twice only adds key-value editor once"
		);

		el.dispatch("hide-key-value-editor", ["obj"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			[],
			"dispatching hide-key-value-editor event hides key-value-editor"
		);

		el.dispatch("display-key-value-editor", ["obj"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			["obj"],
			"dispatching display-key-value-editor event displays key-value editor again"
		);

		el.dispatch("set-json-path-value", ["obj.foo"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			[],
			"dispatching set-json-path-value event hides key-value-editor"
		);

		el.listenTo("json", noop);
		el.json = { arr: [] };

		el.dispatch("add-child", ["arr"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			["arr.0"],
			"dispatching add-child event for a path containing an array displays key-value editor for array's first child"
		);

		el.dispatch("add-child", ["arr"]);
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			["arr.0"],
			"dispatching add-child event twice only adds key-value editor once"
		);

		el.dispatch("display-key-value-editor", ["obj"]);
		el.dispatch("display-key-value-editor", ["other"]);
		el.dispatch("hide-all-key-value-editors");
		assert.deepEqual(
			el.displayedKeyValueEditors.serialize(),
			[],
			"dispatching hide-all-key-value-editors hides all key-value editors"
		);
	});

	it("isExpanded", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("expandedKeys", noop);

		el.expandedKeys = ["foo", "bar"];

		assert.equal(el.isExpanded("foo"), true, "foo is expanded");

		assert.equal(el.isExpanded("bar"), true, "bar is expanded");

		assert.equal(el.isExpanded("baz"), false, "baz is collapsed");
	});

	it("toggleExpanded", done => {
		const el = new JSONTreeEditor();
		el.initialize();

		el.listenTo("toggle-expanded", (ev, path) => {
			assert.ok(true, "should dispatch toggle-expanded event");
			assert.equal(path, "foo", "should pass correct path");
			done();
		});

		el.toggleExpanded(ev, "foo");
	});

	it("getJSON / setJSON", () => {
		const el = new JSONTreeEditor();
		el.initialize();
		el.listenTo("json", noop);

		const someJSON = { foo: "bar" };

		el.setJSON(someJSON);

		assert.deepEqual(el.json.serialize(), someJSON, "setJSON works");

		assert.deepEqual(el.getJSON(), someJSON, "getJSON works");
	});

	it("setPathValue", done => {
		const el = new JSONTreeEditor();
		el.initialize();

		el.listenTo("set-json-path-value", (ev, path, value) => {
			assert.ok(true, "should dispatch set-json-path-value event");
			assert.equal(path, "foo", "should pass correct path");
			assert.equal(value, "bar", "should pass correct value");
			done();
		});

		el.setPathValue(ev, "foo", "bar");
	});

	it("deletePath", done => {
		const el = new JSONTreeEditor();
		el.initialize();

		el.listenTo("delete-json-path", (ev, path) => {
			assert.ok(true, "should dispatch delete-json-path event");
			assert.equal(path, "foo", "should pass correct path");
			done();
		});

		el.deletePath(ev, "foo");
	});

	it("addChild", done => {
		const el = new JSONTreeEditor();
		el.initialize();

		el.listenTo("add-child", (ev, path) => {
			assert.ok(true, "should dispatch add-child event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		el.addChild(ev, "foo.bar");
	});

	it("shouldDisplayKeyValueEditor", () => {
		const el = new JSONTreeEditor();
		el.listenTo("displayedKeyValueEditors", noop);
		el.initialize();

		el.displayedKeyValueEditors = ["foo", "bar"];

		assert.equal(
			el.shouldDisplayKeyValueEditor("foo"),
			true,
			"key-value editor shown for foo"
		);

		assert.equal(
			el.shouldDisplayKeyValueEditor("bar"),
			true,
			"key-value editor shown for bar"
		);

		assert.equal(
			el.shouldDisplayKeyValueEditor("baz"),
			false,
			"key-value editor not shown for baz"
		);
	});

	it("hideKeyValueEditor", done => {
		const el = new JSONTreeEditor();
		el.initialize();

		el.listenTo("hide-key-value-editor", (ev, path) => {
			assert.ok(true, "should dispatch hide-key-value-editor event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		el.hideKeyValueEditor(ev, "foo.bar");
	});

	describe("makeSetKeyValueForPath", () => {
		it("allows setting a value at a string path", done => {
			const el = new JSONTreeEditor();
			el.initialize();

			el.listenTo("set-json-path-value", (ev, path, value) => {
				assert.ok(true, "should dispatch set-json-path-value event");
				assert.equal(path, "foo.bar", "should pass correct path+key");
				assert.equal(value, "baz", "should pass correct value");
				done();
			});

			const setKeyValueForPath = el.makeSetKeyValueForPath("foo");
			setKeyValueForPath("bar", "baz");
		});

		it("allows setting a value at an empty path", done => {
			const el = new JSONTreeEditor();
			el.initialize();

			el.listenTo("set-json-path-value", (ev, path, value) => {
				assert.ok(true, "should dispatch set-json-path-value event");
				assert.equal(path, "bar", "should pass correct key");
				assert.equal(value, "baz", "should pass correct value");
				done();
			});

			const setKeyValueForPath = el.makeSetKeyValueForPath("");
			setKeyValueForPath("bar", "baz");
		});
	});

	it("getTypeNameAtPath", () => {
		const el = new JSONTreeEditor().initialize({
			typeNames: { foo: "BarList[]", "foo.0": "Bar{}" }
		});

		assert.equal(el.getTypeNameAtPath("foo"), "BarList[]", "foo");
		assert.equal(el.getTypeNameAtPath("foo.0"), "Bar{}", "foo.0");
	});

	it("getMessageAtPath", () => {
		const el = new JSONTreeEditor().initialize({
			messages: {
				prop: { type: "info", message: "here is some info" },
				"prop.0": { type: "warning", message: "here is a warning" }
			}
		});

		assert.equal(el.getMessageAtPath("prop").type, "info", "prop type");
		assert.equal(
			el.getMessageAtPath("prop").message,
			"here is some info",
			"prop message"
		);

		assert.equal(el.getMessageAtPath("prop.0").type, "warning", "prop.0 type");
		assert.equal(
			el.getMessageAtPath("prop.0").message,
			"here is a warning",
			"prop.0 message"
		);
	});
});

describe("JSONTreeEditor - Component", () => {
	it("changing a key value should call setPathValue", done => {
		const el = new JSONTreeEditor().render({
			json: { name: "Kevin" }
		});

		const nameEditor = el.querySelector(".value editable-span");

		el.listenTo("set-json-path-value", (ev, path, value) => {
			assert.equal(path, "name", "correct name");
			assert.equal(value, "Connor", "correct value");
			done();
		});

		nameEditor.text = "Connor";
	});

	it("changing json should re-render the tree", () => {
		const el = new JSONTreeEditor().render({
			json: {
				name: "Kevin",
				person: { name: "Kevin" },
				class: { student: { name: "Kevin" } }
			}
		});

		el.listenTo("expandedKeys", () => {});
		el.expandedKeys = ["person", "class", "class.student"];

		assert.equal(
			el.querySelectorAll(".value span")[0].innerHTML.trim(),
			"Kevin",
			"default name"
		);
		assert.equal(
			el.querySelectorAll(".value span")[1].innerHTML.trim(),
			"Kevin",
			"default person.name"
		);
		assert.equal(
			el.querySelectorAll(".value span")[2].innerHTML.trim(),
			"Kevin",
			"default class.student.name"
		);

		el.json = {
			name: "Connor", //updated
			person: { name: "Kevin" },
			class: { student: { name: "Kevin" } }
		};

		assert.equal(
			el.querySelectorAll(".value span")[0].innerHTML.trim(),
			"Connor",
			"updated name"
		);

		el.json = {
			name: "Connor",
			person: { name: "Connor" }, //updated
			class: { student: { name: "Kevin" } }
		};
		assert.equal(
			el.querySelectorAll(".value span")[1].innerHTML.trim(),
			"Connor",
			"updated person.name"
		);

		el.json = {
			name: "Connor",
			person: { name: "Connor" },
			class: { student: { name: "Connor" } } //updated
		};
		assert.equal(
			el.querySelectorAll(".value span")[2].innerHTML.trim(),
			"Connor",
			"updated class.student.name"
		);
	});

	it("changing typenames should re-render the tree", () => {
		const el = new JSONTreeEditor().render({
			json: {
				people: [
					{
						name: "Kevin"
					}
				]
			}
		});

		el.listenTo("expandedKeys", () => {});
		el.expandedKeys = ["people"];

		assert.equal(
			el.querySelectorAll(".type")[0].innerHTML.trim(),
			"Array(1)",
			"default type for people"
		);
		assert.equal(
			el.querySelectorAll(".type")[1].innerHTML.trim(),
			"Object",
			"default type for person"
		);

		el.typeNames = { people: "People[]", "people.0": "Person{}" };

		assert.equal(
			el.querySelectorAll(".type")[0].innerHTML.trim(),
			"People(1)",
			"correct type for people"
		);
		assert.equal(
			el.querySelectorAll(".type")[1].innerHTML.trim(),
			"Person",
			"correct type for person"
		);
	});
});

describe("KeyValueEditor", () => {
	it("should call setKeyValue when key and value are set", () => {
		const el = new KeyValueEditor().initialize({
			setKeyValue(key, value) {
				assert.equal(key, "theKey", "passed the correct key");
				assert.equal(value, "theValue", "passed the correct value");
			}
		});

		el.key = "notTheKey";
		el.key = "theKey";
		el.value = "theValue";
	});
});

describe("helpers", () => {
	it("removeTrailingBracketsOrBraces", () => {
		assert.equal(
			removeTrailingBracketsOrBraces("Foo[]"),
			"Foo",
			"works for brackets"
		);

		assert.equal(
			removeTrailingBracketsOrBraces("Foo{}"),
			"Foo",
			"works for braces"
		);
	});
});
