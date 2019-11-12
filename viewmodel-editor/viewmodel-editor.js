import DeepObservable from "can-deep-observable";
import {
	diff,
	key as canKey,
	ObservableArray,
	ObservableObject,
	Observation,
	Reflect,
	StacheElement,
	type
} from "can";

import "../json-tree-editor/json-tree-editor";
import "viewmodel-editor/viewmodel-editor.less";

const clone = obj => {
	const c = Array.isArray(obj) ? [] : {};

	for (var i in obj) {
		if (obj[i] != null && typeof obj[i] === "object") {
			// jshint ignore:line
			c[i] = clone(obj[i]);
		} else {
			c[i] = obj[i];
		}
	}

	return c;
};

export default class ViewmodelEditor extends StacheElement {
	static get view() {
		return `
			<div class="header">
				{{# unless(this.tagName) }}
					<h1 class="select-vm">Select an Element to see its ViewModel</h1>
				{{ else }}
					{{# unless(this.viewModelData) }}
						<h1>{{ this.tagName }} does not have a ViewModel</h1>
					{{ else }}
						<h1>{{ this.tagName }} ViewModel</h1>

						<span class="buttons">
							{{# if(this.jsonEditorPatches.length) }}
								<button on:click="this.save()">Apply</button>
								<button on:click="this.reset()">Reset</button>
							{{ else }}
								<button class="disabled">Up To Date</button>
							{{/ if }}
						</span>
					{{/ unless }}
				{{/ unless }}
			</div>

			{{# and(this.tagName, this.viewModelData) }}
				<json-tree-editor
					json:from="this.json"
					typeNames:from="this.typeNamesData"
					messages:from="this.messages"
					rootNodeName:raw="ViewModel"
					expandedKeys:to="this.expandedKeys"
				></json-tree-editor>
			{{/ and }}
		`;
	}

	static get props() {
		return {
			tagName: { type: type.convert(String), default: "" },

			viewModelData: {
				type: type.convert(ObservableObject),

				get default() {
					return new ObservableObject();
				}
			},

			typeNamesData: {
				type: type.convert(ObservableObject),

				get default() {
					return new ObservableObject();
				}
			},

			messages: {
				type: type.convert(ObservableObject),

				get default() {
					return new ObservableObject();
				}
			},

			undefineds: {
				type: type.convert(ObservableArray),

				get default() {
					return new ObservableArray();
				}
			},

			expandedKeys: type.convert(ObservableArray),
			editorError: type.convert(String),

			get serializedViewModelData() {
				return this.viewModelData.serialize();
			},

			json: {
				type: DeepObservable,
				value({ listenTo, resolve }) {
					let json = resolve(
						Reflect.new(
							DeepObservable,
							this.getPatchedData(this.serializedViewModelData, this.jsonEditorPatches)
						)
					);

					listenTo("jsonEditorPatches", () => {
						updateVm(null, this.serializedViewModelData);
					});

					const setPatches = (newJSON, oldJSON) => {
						const patches = diff.deep(oldJSON, newJSON);
						this.jsonEditorPatches.push(...patches);
					};

					const updateVm = (ev, vmData) => {
						let newJson = this.getPatchedData(vmData, this.jsonEditorPatches);

						// don't set patches when json is changed
						// due to viewModel data being updated
						Reflect.offValue(serializedJSON, setPatches);
						Reflect.updateDeep(json, newJson);
						Reflect.onValue(serializedJSON, setPatches);
					}

					const serializedJSON = new Observation(() => json.serialize());
					Reflect.onValue(serializedJSON, setPatches);

					listenTo("serializedViewModelData", updateVm);

					listenTo("undefineds", (ev, undefineds) => {
						// don't set patches when json is changed
						// due to undefineds data being updated
						Reflect.offValue(serializedJSON, setPatches);

						// create an object with undefined values
						let undefinedsObject = undefineds.reduce((obj, key) => {
							obj[key] = undefined;
							return obj;
						}, {});
						// create list of patches to apply to set undefineds
						let undefinedPatches = diff.deep({}, undefinedsObject);

						// apply patches to json to set all undefined values from `undefineds`
						// and then set all patches from changes made to json
						let allPatches = [...undefinedPatches, ...this.jsonEditorPatches];
						let newJson = this.getPatchedData(json.serialize(), allPatches);
						Reflect.updateDeep(json, newJson);

						Reflect.onValue(serializedJSON, setPatches);
					});

					listenTo("tagName", () => {
						Reflect.offValue(serializedJSON, setPatches);
						json.update({});
						Reflect.onValue(serializedJSON, setPatches);
						this.jsonEditorPatches = [];
					});
				}
			},

			jsonEditorPatches: {
				type: type.ObservableArray,
				get default() {
					return []
				}
			},

			updateValues: {
				get default() {
					return data => {
						console.log("updating viewModel with", data);
					};
				}
			}
		};
	}

	getPatchedData(destination, patches) {
		const patchedData = clone(destination);
		let arr = []

		patches.forEach(({ type, key, value, index, deleteCount, insert }) => {
			switch (type) {
				case "add":
				case "set":
					canKey.set(patchedData, key, value);
					break;
				case "delete":
					canKey.deleteKey(patchedData, key);
					break;
				case "splice":
					arr = canKey.get(patchedData, key);
					arr.splice(index, deleteCount, ...insert);
					break;
			}
		});

		return patchedData;
	}

	save() {
		this.updateValues(this.jsonEditorPatches);
		this.jsonEditorPatches = [];
	}

	reset() {
		this.jsonEditorPatches = [];
	}

	static get propertyDefaults() {
		return DeepObservable;
	}
}

customElements.define("viewmodel-editor", ViewmodelEditor);

export {
	StacheElement,
	ObservableObject,
	ObservableArray,
	canKey as key,
	diff,
	Reflect,
	type,
	Observation
};
