import { Component, DefineMap, DefineList, key as canKey, diff, Reflect, Observation } from "can";

import "../json-tree-editor/json-tree-editor";
import "viewmodel-editor/viewmodel-editor.less";

const clone = (obj) => {
	const c = Array.isArray(obj) ? [] : {};

	for (var i in obj) {
		if(obj[i] != null &&  typeof(obj[i])=="object") { // jshint ignore:line
			c[i] = clone(obj[i]);
		} else {
			c[i] = obj[i];
		}
	}

	return c;
};

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
		tagName: "string",
		viewModelData: { Type: DefineMap, Default: DefineMap },
		typeNamesData: { Type: DefineMap, Default: DefineMap },
		expandedKeys: DefineList,

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

				listenTo("tagName", () => {
					Reflect.offValue(serializedJSON, setPatches);
					json.update({});
					Reflect.onValue(serializedJSON, setPatches);
					jsonPatches = [];
				});
			}
		},

		getPatchedData(destination, patches) {
			const patchedData = clone(destination);

			patches.forEach(({ type, key, value, index, deleteCount, insert }) => {
				switch(type) {
					case "add":
					case "set":
						canKey.set(patchedData, key, value);
						break;
					case "delete":
						canKey.deleteKey(patchedData, key);
						break;
					case "splice":
						let arr = canKey.get(patchedData, key);
						arr.splice(index, deleteCount, ...insert);
						break;
				}
			});

			return patchedData;
		},

		get jsonEditorPatches() {
			return diff.deep(this.serializedViewModelData, this.json.serialize());
		},

		patchedViewModelData: {
			type: "any",
			get(lastSet) {
				if (lastSet) { return lastSet; }
				const patches = this.jsonEditorPatches;
				const patchedViewModelData = this.getPatchedData(this.serializedViewModelData, patches);

				return patchedViewModelData;
			}
		},

		save() {
			this.updateValues( this.patchedViewModelData );
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
		<div class="header">
			{{# unless(tagName) }}
				<h1>Select an Element to see its ViewModel</h1>
			{{ else }}
				{{# unless(viewModelData) }}
					<h1>{{tagName}} does not have a ViewModel</h1>
				{{ else }}
					<h1>{{tagName}} ViewModel</h1>

					{{# if(jsonEditorPatches.length) }}
						<button on:click="this.save()">Apply Changes</button>
					{{ else }}
						<button class="disabled">Up To Date</button>
					{{/ if }}
				{{/ unless }}
			{{/ unless }}
		</div>

		{{# and(tagName, viewModelData) }}
			<json-tree-editor
				json:from="json"
				typeNames:from="typeNamesData"
				rootNodeName:raw="ViewModel"
				expandedKeys:to="expandedKeys"
			></json-tree-editor>
		{{/ and }}
	`
});

export { Component, DefineMap, DefineList, canKey as key, diff, Reflect, Observation };
