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

	it("breakpointsCurrentHeight", () => {
		const viewModel = new ViewModel();
		viewModel.breakpointsSection = { clientHeight: 100 };
		assert.equal(viewModel.breakpointsCurrentHeight, 100, "Got the current height of the breakpoints section");
	});

	it("breakpointsTitleHeight", () => {
		const viewModel = new ViewModel();
		viewModel.breakpointsTitle = { clientHeight: 30 };
		assert.equal(viewModel.breakpointsTitleHeight, 30, "Got the height of the breakpoints section title");
	});
});
