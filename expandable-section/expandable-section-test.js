import { assert } from "chai";
import ExpandableSection from "./expandable-section";

import "steal-mocha";

describe("expandable-section", () => {
	it("expanded", () => {
		let el = new ExpandableSection();
		el.initialize();

		el.listenTo("expanded", () => {});
		assert.equal(el.expanded, false, "defaults to false");

		el.expanded = true;
		assert.equal(el.expanded, true, "can be set to true");

		el.expanded = false;
		assert.equal(el.expanded, false, "can be set to false");

		el.collapsible = false;
		assert.equal(
			el.expanded,
			true,
			"setting collapsible to false sets expanded to true"
		);

		el.expanded = false;
		assert.equal(
			el.expanded,
			true,
			"cannot set expanded if collapsible is false"
		);

		el = new ExpandableSection().initialize({ collapsible: false });
		assert.equal(
			el.expanded,
			true,
			"when collapsible is defaulted to false, expanded defaults to true"
		);
	});

	it("collapsible", () => {
		const el = new ExpandableSection();
		assert.equal(el.collapsible, true, "collapsible === true");
	});
});
