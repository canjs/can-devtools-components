import "steal-mocha";
import chai from "chai";
import { ViewModel } from "./viewmodel-editor";

let assert = chai.assert;

describe("viewmodel-editor", function(){
  it("Has message", function(){
    var vm = new ViewModel();
    assert.equal(vm.attr("message"), "This is the viewmodel-editor component");
  });
});
