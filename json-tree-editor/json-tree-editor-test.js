import "steal-mocha";
import chai from "chai";
import { JSONTreeEditor, KeyValueEditor } from "./json-tree-editor";

const assert = chai.assert;

const noop = () => { };
const ev = { stopPropagation: noop };

describe("JSONTreeEditor", () => {
	const ViewModel = JSONTreeEditor.ViewModel;

	it("displayedOptions", () => {
		const vm = new ViewModel();
		vm.listenTo("displayedOptions", noop);

		assert.deepEqual(vm.displayedOptions.serialize(), [ ], "displayedOptions empty by default");

		vm.dispatch("show-options", [ "foo.bar" ]);
		assert.deepEqual(vm.displayedOptions.serialize(), [ "foo.bar" ], "dipatching show-options event shows options");

		vm.dispatch("hide-options", [ "foo.bar" ]);
		assert.deepEqual(vm.displayedOptions.serialize(), [ ], "dipatching hide-options event hides options");

		vm.dispatch("show-options", [ "foo.bar" ]);
		vm.dispatch("show-options", [ "foo.bar" ]);
		assert.deepEqual(vm.displayedOptions.serialize(), [ "foo.bar" ], "dipatching show-options event twice shows options once");

		vm.dispatch("hide-options", [ "foo.bar" ]);
		assert.deepEqual(vm.displayedOptions.serialize(), [ ], "dipatching hide-options event hides options even if show-options was called twice");
	});

	it("expandedKeys", () => {
		const vm = new ViewModel();
		vm.listenTo("expandedKeys", noop);

		assert.deepEqual(vm.expandedKeys.serialize(), [], "nothing expanded by default");

		vm.dispatch("toggle-expanded", [ "foo" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "foo" ], "dispatching a toggle-expanded event expands a key");

		vm.dispatch("toggle-expanded", [ "bar" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "foo", "bar" ], "dispatching two toggle-expanded event expands both keys");

		vm.dispatch("toggle-expanded", [ "foo" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "bar" ], "dispatching a toggle-expanded event collapses a key");

		vm.dispatch("toggle-expanded", [ "bar" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [  ], "dispatching a toggle-expanded event collapses a second key");

		vm.listenTo("json", noop);
		vm.json = { arr: [] };

		vm.dispatch("add-child", [ "arr" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "arr", "arr.0" ], "dispatching an add-child event for a path containing an array expands the array and its first child");

		vm.dispatch("add-child", [ "arr" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "arr", "arr.0" ], "dispatching a second add-child event for a path containing an array does nothing");

		vm.dispatch("delete-json-path", [ "arr.0" ]);
		assert.deepEqual(vm.expandedKeys.serialize(), [ "arr" ], "dispatching a delete-json-path event removes that path from expandedKeys");
	});

	it("json", () => {
		const vm = new ViewModel();
		vm.listenTo("json", noop);

		assert.deepEqual(vm.json.serialize(), { }, "defaults to empty object");

		vm.json = { foo: "bar" };
		assert.deepEqual(vm.json.serialize(), { foo: "bar" }, "can be set");

		vm.dispatch("set-json", [ { abc: "def",	ghi: { jkl: "mno" }, pqr: [ ] } ]);
		assert.deepEqual(vm.json.serialize(), { abc: "def",	ghi: { jkl: "mno" }, pqr: [ ] }, "can be set by dispatching a set-json event");

		vm.dispatch("set-json-path-value", [ "abc", "onetwothree" ]);
		assert.deepEqual(vm.json.serialize(), { abc: "onetwothree",	ghi: { jkl: "mno" }, pqr: [ ] }, "can set a property by dispatching a set-json-path-value event");

		vm.dispatch("set-json-path-value", [ "ghi.jkl", "fourfivesix" ]);
		assert.deepEqual(vm.json.serialize(), { abc: "onetwothree",	ghi: { jkl: "fourfivesix" }, pqr: [ ] }, "can set a nested property by dispatching a set-json-path-value event");

		vm.dispatch("delete-json-path", [ "abc" ]);
		assert.deepEqual(vm.json.serialize(), {	ghi: { jkl: "fourfivesix" }, pqr: [ ] }, "can delete a property by dispatching a delete-json-path event");

		vm.dispatch("delete-json-path", [ "ghi.jkl" ]);
		assert.deepEqual(vm.json.serialize(), {	ghi: { }, pqr: [ ] }, "can delete a nested property by dispatching a delete-json-path event");

		vm.dispatch("add-child", [ "pqr" ]);
		assert.deepEqual(vm.json.serialize(), {	ghi: { }, pqr: [ { } ] }, "dispatching an add-child event will add an empty object to an array");

		vm.dispatch("set-json-path-value", [ "abc", "123" ]);
		assert.deepEqual(vm.json.serialize(), {	abc: 123, ghi: { }, pqr: [ { } ] }, "can set a non-string property by dispatching a set-json-path-value event");

	});

	it("parsedJSON", () => {
		const vm = new ViewModel();
		vm.listenTo("parsedJSON", noop);

		const testCases = [{
			input: { },
			output: [ ],
			name: "empty object"
		}, {
			input: {
				name: "Kevin",
				age: 30,
				likesPizza: true
			},
			output: [{
				key: "name",
				path: "name",
				type: "String",
				value: "Kevin"
			}, {
				key: "age",
				path: "age",
				type: "Number",
				value: 30
			}, {
				key: "likesPizza",
				path: "likesPizza",
				type: "Boolean",
				value: true
			}],
			name: "simple object"
		}, {
			input: {
				name: {
					first: "Connor",
					last: "Phillips"
				}
			},
			output: [{
				key: "name",
				path: "name",
				type: "Object",
				value: [{
					key: "first",
					path: "name.first",
					type: "String",
					value: "Connor"
				}, {
					key: "last",
					path: "name.last",
					type: "String",
					value: "Phillips"
				}]
			}],
			name: "object in object"
		}, {
			input: {
				hobbies: [ "singing", "dancing", "soccer" ]
			},
			output: [{
				key: "hobbies",
				path: "hobbies",
				type: "Array",
				value: [{
					key: 0,
					path: "hobbies.0",
					type: "String",
					value: "singing"
				}, {
					key: 1,
					path: "hobbies.1",
					type: "String",
					value: "dancing"
				},{
					key: 2,
					path: "hobbies.2",
					type: "String",
					value: "soccer"
				}]
			}],
			name: "array in object"
		}, {
			input: {
				person: {
					hobbies: [ "singing", "dancing", "soccer" ]
				}
			},
			output: [{
				key: "person",
				path: "person",
				type: "Object",
				value: [{
					key: "hobbies",
					path: "person.hobbies",
					type: "Array",
					value: [{
						key: 0,
						path: "person.hobbies.0",
						type: "String",
						value: "singing"
					}, {
						key: 1,
						path: "person.hobbies.1",
						type: "String",
						value: "dancing"
					}, {
						key: 2,
						path: "person.hobbies.2",
						type: "String",
						value: "soccer"
					}]
				}]
			}],
			name: "array in object in object"
		}, {
			input: {
				hobbies: [
					{ name: "singing" }, { name: "dancing" }, { name: "soccer" }
				]
			},
			output: [{
				key: "hobbies",
				path: "hobbies",
				type: "Array",
				value: [{
					key: 0,
					path: "hobbies.0",
					type: "Object",
					value: [{
						key: "name",
						path: "hobbies.0.name",
						type: "String",
						value: "singing"
					}]
				}, {
					key: 1,
					path: "hobbies.1",
					type: "Object",
					value: [{
						key: "name",
						path: "hobbies.1.name",
						type: "String",
						value: "dancing"
					}]
				},{
					key: 2,
					path: "hobbies.2",
					type: "Object",
					value: [{
						key: "name",
						path: "hobbies.2.name",
						type: "String",
						value: "soccer"
					}]
				}]
			}],
			name: "array of objects"
		}, {
			input: {
				hobbies: [
					{ }, { name: "dancing" }
				]
			},
			output: [{
				key: "hobbies",
				path: "hobbies",
				type: "Array",
				value: [{
					key: 0,
					path: "hobbies.0",
					type: "Object",
					value: [ ]
				}, {
					key: 1,
					path: "hobbies.1",
					type: "Object",
					value: [{
						key: "name",
						path: "hobbies.1.name",
						type: "String",
						value: "dancing"
					}]
				}]
			}],
			name: "array with empty object"
		}];

		testCases.forEach(t => {
			vm.json = t.input;
			assert.deepEqual(vm.parsedJSON.serialize(), t.output, `works for ${t.name}`);
		});
	});

	it("displayedKeyValueEditors", () => {
		const vm = new ViewModel();
		vm.listenTo("displayedKeyValueEditors", noop);

		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ ], "nothing displayed by default");

		vm.dispatch("display-key-value-editor", [ "obj" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ "obj" ], "dispatching display-key-value-editor event displays key-value editor");

		vm.dispatch("display-key-value-editor", [ "obj" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ "obj" ], "dispatching display-key-value-editor event twice only adds key-value editor once");

		vm.dispatch("hide-key-value-editor", [ "obj" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ ], "dispatching hide-key-value-editor event hides key-value-editor");

		vm.dispatch("display-key-value-editor", [ "obj" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ "obj" ], "dispatching display-key-value-editor event displays key-value editor again");

		vm.dispatch("set-json-path-value", [ "obj.foo" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ ], "dispatching set-json-path-value event hides key-value-editor");

		vm.listenTo("json", noop);
		vm.json = { arr: [] };

		vm.dispatch("add-child", [ "arr" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ "arr.0" ], "dispatching add-child event for a path containing an array displays key-value editor for array's first child");

		vm.dispatch("add-child", [ "arr" ]);
		assert.deepEqual(vm.displayedKeyValueEditors.serialize(), [ "arr.0" ], "dispatching add-child event twice only adds key-value editor once");
	});

	it("isExpanded", () => {
		const vm = new ViewModel();
		vm.listenTo("expandedKeys", noop);

		vm.expandedKeys = [ "foo", "bar" ];

		assert.equal(vm.isExpanded("foo"), true, "foo is expanded");

		assert.equal(vm.isExpanded("bar"), true, "bar is expanded");

		assert.equal(vm.isExpanded("baz"), false, "baz is collapsed");
	});

	it("toggleExpanded", (done) => {
		const vm = new ViewModel();

		vm.listenTo("toggle-expanded", (ev, path) => {
			assert.ok(true, "should dispatch toggle-expanded event");
			assert.equal(path, "foo", "should pass correct path");
			done();
		});

		vm.toggleExpanded(ev, "foo");
	});

	it("getJSON / setJSON", () => {
		const vm = new ViewModel();
		vm.listenTo("json", noop);

		const someJSON = { foo: "bar" };

		vm.setJSON(someJSON);

		assert.deepEqual(vm.json.serialize(), someJSON, "setJSON works");

		assert.deepEqual(vm.getJSON(), someJSON, "getJSON works");
	});

	it("setPathValue", (done) => {
		const vm = new ViewModel();

		vm.listenTo("set-json-path-value", (ev, path, value) => {
			assert.ok(true, "should dispatch set-json-path-value event");
			assert.equal(path, "foo", "should pass correct path");
			assert.equal(value, "bar", "should pass correct value");
			done();
		});

		vm.setPathValue("foo", "bar");
	});

	it("deletePath", (done) => {
		const vm = new ViewModel();

		vm.listenTo("set-json-path-value", (ev, path, value) => {
			assert.ok(true, "should dispatch set-json-path-value event");
			assert.equal(path, "foo", "should pass correct path");
			assert.equal(value, "bar", "should pass correct value");
			done();
		});

		vm.setPathValue("foo", "bar");
	});

	it("addChild", (done) => {
		const vm = new ViewModel();

		vm.listenTo("add-child", (ev, path) => {
			assert.ok(true, "should dispatch add-child event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		vm.addChild(ev, "foo.bar");
	});

	it("shouldDisplayKeyValueEditor", () => {
		const vm = new ViewModel();
		vm.listenTo("displayedKeyValueEditors", noop);

		vm.displayedKeyValueEditors = [ "foo", "bar" ];

		assert.equal(vm.shouldDisplayKeyValueEditor("foo"), true, "key-value editor shown for foo");

		assert.equal(vm.shouldDisplayKeyValueEditor("bar"), true, "key-value editor shown for bar");

		assert.equal(vm.shouldDisplayKeyValueEditor("baz"), false, "key-value editor not shown for baz");
	});

	it("hideKeyValueEditor", (done) => {
		const vm = new ViewModel();

		vm.listenTo("hide-key-value-editor", (ev, path) => {
			assert.ok(true, "should dispatch hide-key-value-editor event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		vm.hideKeyValueEditor(ev, "foo.bar");
	});

	describe("makeSetKeyValueForPath", () => {
		it("allows setting a value at a string path", (done) => {
			const vm = new ViewModel();

			vm.listenTo("set-json-path-value", (ev, path, value) => {
				assert.ok(true, "should dispatch set-json-path-value event");
				assert.equal(path, "foo.bar", "should pass correct path+key");
				assert.equal(value, "baz", "should pass correct value");
				done();
			});

			const setKeyValueForPath = vm.makeSetKeyValueForPath("foo");
			setKeyValueForPath("bar", "baz");
		});

		it("allows setting a value at an empty path", (done) => {
			const vm = new ViewModel();

			vm.listenTo("set-json-path-value", (ev, path, value) => {
				assert.ok(true, "should dispatch set-json-path-value event");
				assert.equal(path, "bar", "should pass correct key");
				assert.equal(value, "baz", "should pass correct value");
				done();
			});

			const setKeyValueForPath = vm.makeSetKeyValueForPath("");
			setKeyValueForPath("bar", "baz");
		});
	});

	it("showOptions", (done) => {
		const vm = new ViewModel();

		vm.listenTo("show-options", (ev, path) => {
			assert.ok(true, "should dispatch show-options event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		vm.showOptions(ev, "foo.bar");
	});

	it("hideOptions", (done) => {
		const vm = new ViewModel();

		vm.listenTo("hide-options", (ev, path) => {
			assert.ok(true, "should dispatch hide-options event");
			assert.equal(path, "foo.bar", "should pass correct path");
			done();
		});

		vm.hideOptions(ev, "foo.bar");
	});

	it("shouldShowOptions", () => {
		const vm = new ViewModel();
		vm.listenTo("displayedOptions", noop);

		vm.displayedOptions = [ "foo", "bar" ];

		assert.equal(vm.shouldShowOptions("foo"), true, "options shown for foo");

		assert.equal(vm.shouldShowOptions("bar"), true, "options shown for bar");

		assert.equal(vm.shouldShowOptions("baz"), false, "options not shown for baz");
	});
});

describe("KeyValueEditor", () => {
	const ViewModel = KeyValueEditor.ViewModel;

	it("should call setKeyValue when key and value are set", () => {
		const vm = new ViewModel({
			setKeyValue(key, value) {
				assert.equal(key, "theKey", "passed the correct key");
				assert.equal(value, "theValue", "passed the correct value");
			}
		});

		vm.key = "notTheKey";

		vm.key = "theKey";
		vm.value = "theValue";
	});
});
