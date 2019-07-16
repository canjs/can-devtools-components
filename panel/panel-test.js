import Component from "./panel";

import "steal-mocha";
import chai from "chai";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("components-panel", () => {
	it("basics", () => {
		const vm = new ViewModel();
		assert.ok(vm);
	});
});
