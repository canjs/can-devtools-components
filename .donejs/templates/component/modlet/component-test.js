import "steal-mocha";
import chai from "chai";
import Component from "./<%= name %>";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("<%= module %>", () => {
	it("Has message", () => {
		const vm = new ViewModel();
		assert.equal(vm.message, "This is the <%= tag %> component");
	});
});
