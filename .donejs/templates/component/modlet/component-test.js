import "steal-mocha";
import chai from "chai";
import Component from "./<%= name %>";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("<%= module %>", function(){
	it("Has message", function(){
		const vm = new ViewModel();
		assert.equal(vm.message, "This is the <%= tag %> component");
	});
});
