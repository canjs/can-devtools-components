import { Component, DefineMap, key as canKey, diff } from "can";
import JSONEditor from "jsoneditor";

import "viewmodel-editor/viewmodel-editor.less";

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
		connectedCallback(element) {
			let container = element.querySelector(".jsoneditor-container");
			this.editor = new JSONEditor(container, {
				mode: "code"/*,
				modes: [ "code", "form", "tree" ],
				search: false
				history: false*/
			});

			this.listenTo("json", () => {
				this.editor.set(this.json);
			});

			this.listenTo(document.querySelector(".ace_content"), "click", () => {
				this.updatesPaused = true;
			});

			this.listenTo(window, "blur", () => {
				this.updatesPaused = false;
				this.updateValues(this.json);
			});

			return this.stopListening.bind(this);
		},

		tagName: "string",
		viewModelData: { Type: DefineMap, Default: DefineMap },

		updatesPaused: { type: "boolean", default: false },

		saving: {
			value({ listenTo, resolve }) {
				resolve(false);

				listenTo("updatesPaused", (ev, paused) => {
					if (!paused) {
						resolve(true);
					}
				});

				listenTo("serializedViewModelData", () => {
					resolve(false);
				});
			}
		},

		// allow overwriting editor for testing
		editor: "any",

		get serializedViewModelData() {
			return this.viewModelData.serialize();
		},

		json: {
			type: "any",

			value({ listenTo, lastSet, resolve }) {
				// allow manually overwriting json for testing
				listenTo(lastSet, resolve);

				// update json when viewModel is replaced or updated
				// as long as updates are not paused
				listenTo("serializedViewModelData", (ev, currentViewModelData, lastViewModelData) => {
					if (!this.updatesPaused) {
						let patchedData = this.getPatchedData(
							this.json,
							lastViewModelData,
							currentViewModelData
						);

						resolve( patchedData );
					}
				});

				// update with latest viewModel data when unpaused
				listenTo("updatesPaused", (ev, paused) => {
					if (!paused) {
						let patchedData = this.getPatchedData(
							this.serializedViewModelData,
							this.json,
							this.editor.get()
						);

						resolve( patchedData );
					}
				});

				// set initial json to serialized viewModelData
				resolve(this.serializedViewModelData);
			}
		},

		getPatchedData(destination, oldSource, newSource) {
			destination = Object.assign({}, destination);
			let patches = diff.deep(oldSource, newSource);
			patches.forEach(({ type, key, value, index, deleteCount, insert }) => {
				switch(type) {
					case "add":
					case "set":
						canKey.set(destination, key, value);
						break;
					case "delete":
						canKey.deleteKey(destination, key);
						break;
					case "splice":
						let arr = canKey.get(destination, key);
						arr.splice(index, deleteCount, ...insert);
						break;
				}
			});

			return destination;
		},

		updateValues(data) {
			console.log("updating viewModel with", data);
		}
	},
	view: `
		{{# unless(tagName) }}
			<h1>Select an Element to see its ViewModel</h1>
		{{ else }}
			{{# unless(viewModelData) }}
				<h1><{{tagName}}> does not have a ViewModel</h1>
			{{ else }}
				<h1><{{tagName}}> ViewModel</h1>
			{{/ unless }}
		{{/ unless }}

		<div class="jsoneditor-container {{#if(saving)}}disabled{{/if}}"></div>

		{{# if(tagName) }}
			<button>Save</button>
		{{/if}}
	`
});
