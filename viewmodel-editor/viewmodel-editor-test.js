import "steal-mocha";
import chai from "chai";
import Component from "./viewmodel-editor";
import DefineMap from "can-define/map/map";

let ViewModel = Component.ViewModel;
let assert = chai.assert;

describe("viewmodel-editor", () => {
	it("can pass in a setKeyValue function for editing external VM", () => {
		const realVM = new DefineMap({
			foo: "abc",
			bar: "xyz"
		});

		const vmEditor = new ViewModel({
			viewModelData: realVM.serialize(),
			setKeyValue: function(key, value) {
				realVM[key] = value;
			}
		});

		assert.equal(vmEditor.viewModelData.foo, "abc", "vmEditor initial value");
		assert.equal(realVM.foo, "abc", "realVM initial value");

		vmEditor.setKeyValue("foo", "def");

		assert.equal(vmEditor.viewModelData.foo, "abc", "vmEditor unchanged value");
		assert.equal(realVM.foo, "def", "realVM changed value");
	});

	it("updateViewModel calls setKeyValue for each property", () => {
		const realVM = new DefineMap({
			foo: "abc",
			bar: "xyz"
		});

		let setKeyValueCallCount = 0;
		let setKeyValues = {};
		const vmEditor = new ViewModel({
			viewModelData: realVM.serialize(),
			setKeyValue: function(key, value) {
				setKeyValues[key] = value;
				setKeyValueCallCount++;
			}
		});

		vmEditor.updateViewModel([{
			foo: "def",
			bar: "uvw"
		}]);

		assert.equal(setKeyValueCallCount, 2, "setKeyValue called twice");
		assert.equal(setKeyValues["foo"], "def", "setKeyValue('foo', 'def')");
		assert.equal(setKeyValues["bar"], "uvw", "setKeyValue('bar', 'uvw')");
	});
});
