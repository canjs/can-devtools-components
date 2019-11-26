import { assert } from "chai";
import EditableSpan from "./editable-span";

import "steal-mocha";

const noop = () => {};
const ev = { stopPropagation: noop };

describe("editable-span", () => {
	describe("ViewModel", () => {
		it("edit() / save()", () => {
			const el = new EditableSpan();
			el.initialize();

			el.listenTo("editing", () => {});
			el.listenTo("text", () => {});

			el.edit(ev);

			assert.ok(el.editing, "edit() sets editing to true");
			el.connect(); // start listeners
			el.render(); // ensure the span child is available
			el.querySelector("span").appendChild(document.createElement("br"));  // this happens often when the user hits enter.

			el.save("foo");

			assert.notOk(el.editing, "save() sets editing to false");
			assert.equal(el.text, "foo", "save() sets text");
			assert.equal(el.querySelector("span").children.length, 0, "save() removes line breaks.");
		});

		it("showOptions", () => {
			const el = new EditableSpan();

			assert.notOk(el.showOptions, "showOptions defaults to false");

			el.editing = true;
			assert.notOk(
				el.showOptions,
				"showOptions === false when editing === true without options"
			);

			el.options = ["one"];
			assert.ok(
				el.showOptions,
				"showOptions === true when editing === true with options"
			);

			el.editing = false;
			assert.notOk(
				el.showOptions,
				"showOptions === false when editing === false with options"
			);
		});
	});

	describe("Component", () => {
		it("renders correctly", () => {
			const el = new EditableSpan().render({
				text: "some text"
			});

			const valueSpan = el.querySelector("span");

			assert.equal(
				valueSpan.innerText,
				"some text",
				"renders text without spaces"
			);
		});
	});
});
