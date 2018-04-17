import "steal-mocha";
import chai from "chai";
import Component from "./<%= name %>";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("<%= module %>", () => {
	it("VM", () => {
		const vm = new ViewModel();
		assert.equal(typeof vm, "object");
	});
});
