import "steal-mocha";
import chai from "chai";
import Component from "./queues-logstack";

const ViewModel = Component.ViewModel;
const assert = chai.assert;

describe("queues-logstack", () => {
	it("VM", () => {
		const vm = new ViewModel();
		assert.equal(typeof vm, "object");
	});
});
