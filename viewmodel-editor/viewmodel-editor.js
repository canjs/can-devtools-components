import { Component, DefineMap, key as canKey, diff, Reflect, Observation } from "can";

import "../json-tree-editor/json-tree-editor";
import "viewmodel-editor/viewmodel-editor.less";

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
		// allow overwriting editor for testing
		editor: "any",
		tagName: "string",
		viewModelData: { Type: DefineMap, Default: DefineMap },

		get serializedViewModelData() {
			return this.viewModelData.serialize();
		},

		json: {
			value({ listenTo, lastSet, resolve }) {
				let json = resolve(
					new DefineMap(this.serializedViewModelData)
				);
				let jsonPatches = [];

				const setPatches = (newJSON, oldJSON) => {
					const patches = diff.deep(oldJSON, newJSON);
					jsonPatches.push( ...patches );
				};

				listenTo("reset-json-patches", () => {
					jsonPatches = [];
				});

				const serializedJSON = new Observation(() => json.serialize());
				Reflect.onValue(serializedJSON, setPatches);

				listenTo("serializedViewModelData", (ev, vmData) => {
					let newJson = this.getPatchedData(vmData, jsonPatches);

					// don't set patches when json is changed
					// because viewModel data is updated
					Reflect.offValue(serializedJSON, setPatches);
					Reflect.assignDeep(json, newJson);
					Reflect.onValue(serializedJSON, setPatches);
				});
			}
		},

		getPatchedData(destination, patches) {
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

		jsonEditorPatches: {
			type: "any",
			get(lastSet) {
				if (lastSet) { return lastSet; }
				const patches = diff.deep(this.serializedViewModelData, this.json.serialize());
				return this.getPatchedData(this.serializedViewModelData, patches);
			}
		},

		save() {
			this.updateValues( this.jsonEditorPatches );
			this.dispatch("reset-json-patches");
		},

		updateValues: {
			default() {
				return (data) => {
					console.log("updating viewModel with", data);
				};
			}
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

		<json-tree-editor json:from="json"></json-tree-editor>

		{{# if(tagName) }}
			<button on:click="this.save()">Save</button>
		{{/if}}
	`
});
