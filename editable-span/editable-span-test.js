import "steal-mocha";
import chai from "chai";
import EditableSpan from "./editable-span";

const ViewModel = EditableSpan.ViewModel;
const assert = chai.assert;

const noop = () => { };
const ev = { stopPropagation: noop };

describe("editable-span", () => {
	describe("ViewModel", () => {
		it("edit() / save()", () => {
			const vm = new ViewModel();
			vm.listenTo("editing", () => {});
			vm.listenTo("text", () => {});

			vm.edit(ev);

			assert.ok(vm.editing, "edit() sets editing to true");

			vm.save("foo");
			assert.notOk(vm.editing, "save() sets editing to false");
			assert.equal(vm.text, "foo", "save() sets text");
		});

		it("showOptions", () => {
			const vm = new ViewModel();

			assert.notOk(vm.showOptions, "showOptions defaults to false");

			vm.editing = true;
			assert.notOk(vm.showOptions, "showOptions === false when editing === true without options");

			vm.options = [ "one" ];
			assert.ok(vm.showOptions, "showOptions === true when editing === true with options");

			vm.editing = false;
			assert.notOk(vm.showOptions, "showOptions === false when editing === false with options");
		});
	});

	describe("Component", () => {
		it("renders correctly", () => {
			const c = new EditableSpan({
				viewModel: {
					text: "some text"
				}
			});

			const el = c.element;
			const valueSpan = el.querySelector("span");

			assert.equal(valueSpan.innerText, "some text", "renders text without spaces");
		});
	});
});
