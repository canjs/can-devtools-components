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

			el.save("foo");
			assert.notOk(el.editing, "save() sets editing to false");
			assert.equal(el.text, "foo", "save() sets text");
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
