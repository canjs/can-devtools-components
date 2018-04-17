import "steal-mocha";
import chai from "chai";
import { ViewModel } from "./<%= name %>";

let assert = chai.assert;

describe("<%= module %>", function(){
  it("Has message", function(){
    var vm = new ViewModel();
    assert.equal(vm.attr("message"), "This is the <%= tag %> component");
  });
});
