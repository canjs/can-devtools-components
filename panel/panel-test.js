import { assert } from "chai";
import Panel from "./panel";

import "steal-mocha";

describe("components-panel", () => {
	it("basics", () => {
		const vm = new Panel();
		assert.ok(vm);
	});

	it('.disableReset', () => {
		const vm = new Panel();
		assert.isTrue(vm.disableReset);
		vm.filterString = 'Foo';
		assert.isFalse(vm.disableReset);
	});

	it('.filterInput', () => {
		const vm = new Panel();
		vm.render();
		assert.instanceOf(vm.filterInput, HTMLInputElement);
	});

	it('.resetFilter()', () => {
		const vm = new Panel();
		vm.render();
		vm.filterString = 'Foo';
		vm.resetFilter();
		assert.equal(vm.filterString, '');
	});
});
