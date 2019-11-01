import { assert } from "chai";
import Panel from "./panel";

import "steal-mocha";

describe("components-panel", () => {
	it("basics", () => {
		const vm = new Panel();
		assert.ok(vm);
	});
});
