import { assert } from "chai";
import TurningArrow from "./turning-arrow";

import "steal-mocha";

describe("turning-arrow", () => {
	it("animate", () => {
		const el = new TurningArrow();
		el.initialize();

		el.listenTo("animate", () => {});
		assert.equal(el.animate, false, "defaults to false");

		el.down = true;
		assert.equal(
			el.animate,
			true,
			"changes to true first time el.down changes"
		);
	});
});
