import DeepObservable from "can-deep-observable";
import {
	key,
	ObservableArray,
	ObservableObject,
	Reflect,
	stache,
	StacheElement,
	stringToAny,
	type
} from "can";

import "../turning-arrow/turning-arrow";
import "../editable-span/editable-span";
import "./json-tree-editor.less";

stache.addHelper("isObservableArray", val => val instanceof ObservableArray);
stache.addHelper("isNumber", val => typeof val === "number");
stache.addHelper("isEven", num => num % 2 === 0);

export const removeTrailingBracketsOrBraces = str =>
	str.replace(/\[\]|\{\}$/, "");
stache.addHelper(
	"removeTrailingBracketsOrBraces",
	removeTrailingBracketsOrBraces
);

const capitalize = key => {
	return `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
};

const getType = val => {
	if (Reflect.isObservableLike(val)) {
		if (Reflect.isListLike(val)) {
			return "Array";
		} else if (Reflect.isMapLike(val)) {
			return "Object";
		}
	}

	if (val === null) {
		return "Null";
	}

	return capitalize(typeof val);
};

function NumberOrString(val) {
	return val;
}

const wrappedInQuotesRegex = /^["|'].*["|']$/;

class ParsedJSONNode extends ObservableObject {
	static get props() {
		return {
			key: type.convert(NumberOrString),
			value: type.convert(NumberOrString),
			type: String,
			path: String
		};
	}
}

class ParsedJSON extends ObservableArray {
	static get items() {
		return type.convert(ParsedJSONNode);
	}
}

const parseKeyValue = ({ key, value, parentPath }) => {
	let parsedValue;
	const path = `${parentPath ? parentPath + "." : ""}${key}`;

	const mightHaveChildren =
		Reflect.isObservableLike(value) &&
		(Reflect.isListLike(value) || Reflect.isMapLike(value));

	if (mightHaveChildren) {
		parsedValue = new ParsedJSON([]);

		value.forEach((childValue, childKey) => {
			parsedValue.push(
				parseKeyValue({ key: childKey, value: childValue, parentPath: path })
			);
		});
	} else {
		parsedValue = value;
	}

	return {
		key,
		path,
		type: getType(value),
		value: parsedValue
	};
};

export class JSONTreeEditor extends StacheElement {
	static get view() {
		return `
			{{< singleValueTemplate }}
				{{# switch(type) }}
					{{# case("Null") }}
						<div class="value">
							<editable-span
								text:raw="null"
								on:text="scope.vm.setPathValue(null, path, scope.event.target.text)"
							/>
						</div>
					{{/ case }}

					{{# case("Undefined") }}
						<div class="value">
							<editable-span
								text:raw="undefined"
								on:text="scope.vm.setPathValue(null, path, scope.event.target.text)"
							/>
						</div>
					{{/ case }}

					{{# case("String") }}
						<div class="value string">
							<editable-span
								text:from="value"
								on:text="scope.vm.setPathValue(null, path, scope.event.target.text)"
								wrapInQuotes:from="true"
							/>
						</div>
					{{/ case }}

					{{# case("Boolean") }}
						<div class="value">
							<editable-span
								text:from="value"
								on:text="scope.vm.setPathValue(null, path, scope.event.target.text)"
							/>
							<input
								type="checkbox"
								checked:from="value"
								on:click="scope.vm.setPathValue(scope.event, path, scope.element.checked)"
							>
						</div>
					{{/ case }}

					{{# default }}
						<div class="value">
							<editable-span
								text:from="value"
								on:text="scope.vm.setPathValue(null, path, scope.event.target.text)"
							/>
						</div>
					{{/ default }}
				{{/ switch }}
			{{/ singleValueTemplate }}

			{{< typeTemplate }}
				{{ let typeName = scope.vm.getTypeNameAtPath(path) }}

				{{# is(type, "Object") }}
					{{# if(typeName) }}
						<div class="type">{{ removeTrailingBracketsOrBraces(typeName) }}</div>
					{{ else }}
						<div class="type">{{ type }}</div>
					{{/ if }}
				{{/ is }}

				{{# is(type, "Array") }}
					{{# if(typeName) }}
						<div class="type">{{ removeTrailingBracketsOrBraces(typeName) }}({{ value.length }})</div>
					{{ else }}
						<div class="type">{{ type }}({{ value.length }})</div>
					{{/ if }}
				{{/ is }}
			{{/ typeTemplate }}

			{{< keyValueTemplate }}
				{{# unless(isNumber(key)) }}
					<div class="key">{{ key }}:&nbsp;</div>
				{{/ unless }}

				{{> typeTemplate }}

				{{# unless(isObservableArray(value)) }}
					{{> singleValueTemplate }}
				{{/ unless }}

				{{# if( showOptions ) }}
					<div class="options">
						{{# if(isObservableArray(value)) }}
							<div title="Add Child" on:click="scope.vm.addChild(scope.event, path)">&plus;</div>
						{{/ if }}
						<div title="Remove Item" on:click="scope.vm.deletePath(scope.event, path)">&minus;</div>
					</div>
				{{/ if }}
			{{/ keyValueTemplate }}

			{{< nodeTemplate }}
				{{ let showOptions = false }}
				{{ let message = scope.vm.getMessageAtPath(path) }}

				<div class="wrapper">
					{{# if(isObservableArray(value)) }}
						<div on:click="scope.vm.toggleExpanded(scope.event, path)">
							<div
								class="header-container {{# if(showOptions) }}highlighted-item{{/ if }}"
								on:mouseenter="showOptions = true"
								on:mouseleave="showOptions = false"
							>
								<turning-arrow down:bind="scope.vm.isExpanded(path)" />
								{{> keyValueTemplate }}
							</div>
						</div>
					{{ else }}
						<div
							class="kv-group {{# if(showOptions) }}highlighted-item{{/ if }}"
							on:mouseenter="showOptions = true"
							on:mouseleave="showOptions = false"
						>
							{{> keyValueTemplate }}
						</div>
					{{/ if }}

					{{# if(isObservableArray(value)) }}
						{{# if(scope.vm.isExpanded(path)) }}
							{{# if(message) }}
								<div class="message {{ message.type }}">{{ message.message }}</div>
							{{/ if }}

							<div class="list-container" on:click="scope.vm.addChild(scope.event, path)">
								{{# for(child of value) }}
									{{> nodeTemplate child }}
								{{/ for }}

								{{# if(scope.vm.shouldDisplayKeyValueEditor(path)) }}
									<div class="wrapper">
										<div class="kv-group">
											<key-value-editor
												setKeyValue:from="scope.vm.makeSetKeyValueForPath(path)"
											></key-value-editor>
											<div class="options">
												<div
													title="Remove Item"
													on:click="scope.vm.hideKeyValueEditor(scope.event, path)"
												>&minus;</div>
											</div>
										</div>
									</div>
								{{/ if }}
							</div>
						{{/ if }}
					{{/ else }}
						{{# if(message) }}
							<div class="message {{ message.type }}">{{ message.message }}</div>
						{{/ if }}
					{{/ if }}
				</div>
			{{/ nodeTemplate }}

			<div class="wrapper" on:click="scope.vm.addChild(scope.event, '')">
				<div class="list-container">
					{{# for(node of parsedJSON) }}
						{{> nodeTemplate node }}
					{{/ for }}

					{{# if(scope.vm.shouldDisplayKeyValueEditor('')) }}
						<div class="wrapper">
							<div class="kv-group">
								<key-value-editor
									setKeyValue:from="scope.vm.makeSetKeyValueForPath('')"
								></key-value-editor>
								<div class="options">
									<div
										title="Remove Item"
										on:click="scope.vm.hideKeyValueEditor(scope.event, '')"
									>&minus;</div>
								</div>
							</div>
						</div>
					{{/ if }}
				</div>
			</div>
		`;
	}

	static get props() {
		return {
			rootNodeName: { type: String, default: "JSON" },

			typeNames: {
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

			expandedKeys: {
				value({ listenTo, lastSet, resolve }) {
					let keys = resolve(new ObservableArray());

					listenTo(lastSet, resolve);

					listenTo("toggle-expanded", (ev, path) => {
						const index = this.expandedKeys.indexOf(path);

						if (index >= 0) {
							keys.splice(index, 1);
						} else {
							keys.push(path);
						}
					});

					listenTo("add-child", (ev, path) => {
						if (keys.indexOf(path) < 0) {
							keys.push(path);
						}

						let parent = key.get(this.json, path);

						if (parent instanceof ObservableArray) {
							path = path + ".0";
						}

						if (keys.indexOf(path) < 0) {
							keys.push(path);
						}
					});

					listenTo("delete-json-path", (ev, path) => {
						const index = this.expandedKeys.indexOf(path);

						if (index >= 0) {
							keys.splice(index, 1);
						}
					});
				}
			},

			json: {
				type: DeepObservable,

				get default() {
					return Reflect.new(DeepObservable, {});
				},

				value({ listenTo, lastSet, resolve }) {
					let json = resolve(lastSet.value);

					const resetJson = newJson => {
						json = resolve(Reflect.new(DeepObservable, newJson));
					};

					listenTo("set-json", (ev, newJson) => resetJson(newJson));

					listenTo(lastSet, newJson => resetJson(newJson));

					listenTo("set-json-path-value", (ev, path, value) => {
						if (value === "" || value.match(wrappedInQuotesRegex)) {
							value = value.slice(1, -1);
						} else {
							value = stringToAny(value);
						}

						key.set(json, path, value);
					});

					listenTo("delete-json-path", (ev, path) => {
						key.deleteKey(this.json, path);
					});

					listenTo("add-child", (ev, path) => {
						let parent = key.get(json, path);

						if (parent instanceof ObservableArray) {
							parent.unshift({});
						}
					});
				}
			},

			get parsedJSON() {
				const parsed = [];

				Reflect.each(this.json, (value, key) => {
					parsed.push(parseKeyValue({ key, value }));
				});

				return new ParsedJSON(parsed);
			},

			displayedKeyValueEditors: {
				value({ listenTo, lastSet, resolve }) {
					let displayedEditors = resolve(new ObservableArray());

					listenTo(lastSet, resolve);

					listenTo("display-key-value-editor", (ev, path) => {
						const index = displayedEditors.indexOf(path);

						if (index < 0) {
							displayedEditors.push(path);
						}
					});

					listenTo("hide-key-value-editor", (ev, path) => {
						const index = displayedEditors.indexOf(path);

						if (index >= 0) {
							displayedEditors.splice(index, 1);
						}
					});

					listenTo("set-json-path-value", (ev, pathDotKey) => {
						const parts = pathDotKey.split(".");
						const path = parts.slice(0, parts.length - 1).join(".");
						const index = displayedEditors.indexOf(path);

						if (index >= 0) {
							displayedEditors.splice(index, 1);
						}
					});

					listenTo("add-child", (ev, path) => {
						let parent = key.get(this.json, path);

						if (parent instanceof ObservableArray) {
							path = path + ".0";
						}

						if (displayedEditors.indexOf(path) < 0) {
							displayedEditors.push(path);
						}
					});

					listenTo("hide-all-key-value-editors", () => {
						displayedEditors.splice(0);
					});
				}
			}
		};
	}

	// static get propertyDefaults() {
	// 	return DeepObservable;
	// }

	isExpanded(path) {
		return this.expandedKeys.indexOf(path) > -1;
	}

	toggleExpanded(ev, path) {
		if (ev) {
			ev.stopPropagation();
		}
		this.dispatch("toggle-expanded", [path]);
	}

	getJSON() {
		return this.json.serialize();
	}

	setJSON(json) {
		this.dispatch("set-json", [json]);
	}

	setPathValue(ev, path, value) {
		if (ev) {
			ev.stopPropagation();
		}
		this.dispatch("set-json-path-value", [path, "" + value]);
	}

	deletePath(ev, path) {
		if (ev) {
			ev.stopPropagation();
		}
		this.dispatch("delete-json-path", [path]);
	}

	addChild(ev, path) {
		if (ev) {
			ev.stopPropagation();
		}
		this.dispatch("add-child", [path]);
	}

	shouldDisplayKeyValueEditor(path) {
		return this.displayedKeyValueEditors.indexOf(path) >= 0;
	}

	hideKeyValueEditor(ev, path) {
		if (ev) {
			ev.stopPropagation();
		}
		this.dispatch("hide-key-value-editor", [path]);
	}

	makeSetKeyValueForPath(path) {
		return (key, value) => {
			this.dispatch("set-json-path-value", [
				`${path ? path + "." : ""}` + key,
				value
			]);
		};
	}

	getTypeNameAtPath(path) {
		return this.typeNames[path];
	}

	getMessageAtPath(path) {
		return this.messages[path];
	}

	connected() {
		this.listenTo(window, "click", () => {
			this.dispatch("hide-all-key-value-editors");
		});
	}
}

customElements.define("json-tree-editor", JSONTreeEditor);

export class KeyValueEditor extends StacheElement {
	static get view() {
		return `
			<div class="key">
				<editable-span text:bind="this.key" editing:raw="true" tabindex="0" />:&nbsp;
			</div>
			<div class="value">
				<editable-span text:bind="this.value" tabindex="0" />
			</div>
		`;
	}

	static get props() {
		return {
			key: { type: String, default: "" },
			value: { type: String, default: "" },

			setKeyValue: {
				get default() {
					return function defaultSetKeyValue(key, value) {
						console.log(`setKeyValue(${key}, ${value}) called`);
					};
				}
			}
		};
	}

	connected() {
		let key = "";
		let value = "";

		const maybeSetKeyValue = () => {
			if (key && value) {
				this.setKeyValue(key, value);
			}
		};

		this.listenTo("key", (ev, k) => {
			key = k;
			maybeSetKeyValue();
		});

		this.listenTo("value", (ev, v) => {
			value = v;
			maybeSetKeyValue();
		});
	}
}

customElements.define("key-value-editor", KeyValueEditor);
