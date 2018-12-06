import { Component, DefineList, DefineMap, stache, key, Reflect, stringToAny } from "can";

import "../editable-span/editable-span";
import "./json-tree-editor.less";

const isList = (val) => (val instanceof DefineList);
stache.addHelper("isList", isList);
stache.addHelper("isNumber", (val) => typeof val === "number");
stache.addHelper("isEven", (num) => num % 2 === 0);
export const removeTrailingBracketsOrBraces = (str) => str.replace(/\[\]|\{\}$/, "");
stache.addHelper("removeTrailingBracketsOrBraces", removeTrailingBracketsOrBraces);

const capitalize = (key) => {
	return `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
};

const getType = (val) => {
	if (Reflect.isObservableLike(val)) {
		if (Reflect.isListLike(val)) {
			return "Array";
		} else if (Reflect.isMapLike(val)) {
			return "Object";
		}
	}

	return capitalize(typeof val);
};

const NumberOrString = (val) => val;

const wrappedInQuotesRegex = /^["|'].*["|']$/;

const ParsedJSONNode = DefineMap.extend("ParsedJSONNode", {
	key: NumberOrString,
	value: NumberOrString,
	type: "string",
	typeName: "string",
	path: "string",
	id: {
		identity: true,
		get() {
			return `{
				"key": "${this.key}",
				"value": "${this.value}",
				"type": "${this.type}",
				"typeName": "${this.typeName}",
				"path": "${this.path}"
			}`;

		}
	}
});

const ParsedJSON = DefineList.extend("ParsedJSON", {
	"#": ParsedJSONNode
});

const parseKeyValue = ({ key, value, parentPath, getTypeName }) => {
	let parsedValue;
	const path =`${parentPath ? (parentPath + ".") : ""}${key}`;

	const mightHaveChildren = Reflect.isObservableLike(value) &&
		(Reflect.isListLike(value) || Reflect.isMapLike(value));

	if (mightHaveChildren) {
		parsedValue = [];

		value.forEach((childValue, childKey) => {
			parsedValue.push(
				parseKeyValue({ key: childKey, value:childValue, parentPath: path, getTypeName: getTypeName })
			);
		});
	} else {
		parsedValue = value;
	}

	return {
		key,
		path,
		type: getType(value),
		typeName: getTypeName(path),
		value: parsedValue
	};
};

export const JSONTreeEditor = Component.extend({
	tag: "json-tree-editor",

	ViewModel: {
		rootNodeName: { type: "string", default: "JSON" },
		typeNames: { type: "any", default: () => ({}) },

		expandedKeys: {
			value({ listenTo, lastSet, resolve }) {
				let keys = resolve( new DefineList() );

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
					if ( keys.indexOf(path) < 0 ) {
						keys.push(path);
					}

					let parent = key.get(this.json, path);

					if ( parent instanceof DefineList ) {
						path = path + ".0";
					}

					if ( keys.indexOf(path) < 0 ) {
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
			Default: DefineMap,
			value({ listenTo, lastSet, resolve }) {
				let json = resolve( lastSet.value );

				const resetJson = (newJson) => {
					json = resolve( new DefineMap( newJson ) );
				};

				listenTo("set-json", (ev, newJson) => resetJson(newJson));

				listenTo(lastSet, (newJson) => resetJson(newJson));

				listenTo("set-json-path-value", (ev, path, value) => {
					if ( value.match(wrappedInQuotesRegex) ) {
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

					if ( parent instanceof DefineList ) {
						parent.unshift({});
					}
				});
			}
		},

		get parsedJSON() {
			const parsed = new ParsedJSON([]);

			const getTypeName = (path) => {
				return this.typeNames[path];
			};

			Reflect.each(this.json, (value, key) => {
				parsed.push(
					parseKeyValue({ key, value, getTypeName })
				);
			});

			return parsed;
		},

		displayedKeyValueEditors: {
			value({ listenTo, lastSet, resolve }) {
				let displayedEditors = resolve( new DefineList() );

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

					if ( parent instanceof DefineList ) {
						path = path + ".0";
					}

					if ( displayedEditors.indexOf(path) < 0 ) {
						displayedEditors.push(path);
					}
				});
			}
		},

		isExpanded(path) {
			return this.expandedKeys.indexOf(path) > -1;
		},

		toggleExpanded(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("toggle-expanded", [ path ]);
		},

		getJSON() {
			return this.json.serialize();
		},

		setJSON(json) {
			this.dispatch("set-json", [ json ]);
		},

		setPathValue(ev, path, value) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("set-json-path-value", [ path, "" + value ]);
		},

		deletePath(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("delete-json-path", [ path ]);
		},

		addChild(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("add-child", [ path ]);
		},

		shouldDisplayKeyValueEditor(path) {
			return this.displayedKeyValueEditors.indexOf(path) >= 0;
		},

		hideKeyValueEditor(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("hide-key-value-editor", [ path ]);
		},

		makeSetKeyValueForPath(path) {
			return (key, value) => {
				this.dispatch("set-json-path-value", [ `${path ? path + "." : ""}` + key, value ]);
			};
		}
	},

	view: `
		{{< singleValueTemplate }}
			{{# switch(type) }}
				{{# case("String") }}
					<div class="value string">
						<editable-span text:from="value" on:text="scope.vm.setPathValue(null, path, scope.event)" />
					</div>
				{{/ case }}

				{{# case("Boolean") }}
					<div class="value">
						<editable-span text:from="value" on:text="scope.vm.setPathValue(null, path, scope.event)" />
						<input type="checkbox" checked:from="value" on:click="scope.vm.setPathValue(scope.event, path, scope.element.checked)">
					</div>
				{{/ case }}

				{{# default }}
					<div class="value">
						<editable-span text:from="value" on:text="scope.vm.setPathValue(null, path, scope.event)" />
					</div>
				{{/ default }}
			{{/ switch }}
		{{/ singleValueTemplate }}

		{{< keyValueTemplate }}
			{{# unless( isNumber(key) ) }}
				<div class="key">{{key}}:&nbsp;</div>
			{{/ unless }}

			{{# is(type, "Object") }}
				{{# if(typeName) }}
					<div>{{ removeTrailingBracketsOrBraces(typeName) }}</div>
				{{ else }}
					<div>{{type}}</div>
				{{/ if }}
			{{/ is }}

			{{# is(type, "Array") }}
				{{# if(typeName) }}
					<div>{{ removeTrailingBracketsOrBraces(typeName) }}({{value.length}})</div>
				{{ else }}
					<div>{{type}}({{value.length}})</div>
				{{/ if }}
			{{/ is }}

			{{# unless( isList(value) ) }}
				{{> singleValueTemplate }}
			{{/ unless }}

			{{# if( showOptions ) }}
				<div class="options">
					{{# if( isList(value) ) }}
						<div title="Add Child" on:click="scope.vm.addChild(scope.event, path)">&plus;</div>
					{{/ if }}
					<div title="Remove Item" on:click="scope.vm.deletePath(scope.event, path)">&minus;</div>
				</div>
			{{/ if }}
		{{/ keyValueTemplate }}

		{{< nodeTemplate }}
			{{ let showOptions = false }}

			<div class="wrapper">
				{{# if( isList(value) ) }}
					<div on:click="scope.vm.toggleExpanded(scope.event, path)">
						<div class="header-container {{# if( showOptions ) }}highlighted-item{{/ if }}" on:mouseenter="showOptions = true" on:mouseleave="showOptions = false" on:click="showArrowAnimation = true">
							{{# if( scope.vm.isExpanded(path) ) }}
								<div class="arrow-toggle down {{# if(showArrowAnimation) }}animate{{/ if }}"></div>
							{{ else }}
								<div class="arrow-toggle right {{# if(showArrowAnimation) }}animate{{/ if }}"></div>
							{{/ if }}

							{{> keyValueTemplate }}
						</div>
					</div>
				{{ else }}
					<div class="kv-group {{# if( showOptions ) }}highlighted-item{{/ if }}" on:mouseenter="showOptions = true" on:mouseleave="showOptions = false">
						{{> keyValueTemplate }}
					</div>
				{{/ if }}

				{{# if( isList(value) ) }}
					{{# if( scope.vm.isExpanded(path) ) }}
						<div class="list-container" on:click="scope.vm.addChild(scope.event, path)">
							{{# for(child of value) }}
								{{ let showArrowAnimation = false }}
								{{> nodeTemplate child }}
							{{/ for }}

							{{# if( scope.vm.shouldDisplayKeyValueEditor(path) ) }}
								<div class="wrapper">
									<div class="kv-group">
										<key-value-editor
											setKeyValue:from="scope.vm.makeSetKeyValueForPath(path)"
										></key-value-editor>
										<div class="options">
											<div title="Remove Item" on:click="scope.vm.hideKeyValueEditor(scope.event, path)">&minus;</div>
										</div>
									</div>
								</div>
							{{/ if }}
						</div>
					{{/ if }}
				{{/ if }}
			</div>
		{{/ nodeTemplate }}	

		<div class="wrapper" on:click="scope.vm.addChild(scope.event, '')">
			<div class="list-container">
				{{# for(node of parsedJSON) }}
					{{ let showArrowAnimation = false }}
					{{> nodeTemplate node }}
				{{/ for }}

				{{# if( scope.vm.shouldDisplayKeyValueEditor('') ) }}
					<div class="wrapper">
						<div class="kv-group">
							<key-value-editor
								setKeyValue:from="scope.vm.makeSetKeyValueForPath('')"
							></key-value-editor>
							<div class="options">
								<div title="Remove Item" on:click="scope.vm.hideKeyValueEditor(scope.event, '')">&minus;</div>
							</div>
						</div>
					</div>
				{{/ if }}
			</div>
		</div>
	`
});

export const KeyValueEditor = Component.extend({
	tag: "key-value-editor",

	ViewModel: {
		key: { type: "string", default: "" },
		value: { type: "string", default: "" },

		setKeyValue: {
			default() {
				return function defaultSetKeyValue(key, value) {
					console.log(`setKeyValue(${key}, ${value}) called`);
				};
			}
		},

		connectedCallback() {
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
	},

	view: `
		<div class="key">
			<editable-span text:bind="key" editing:raw="true" tabindex="0" />:&nbsp;
		</div>
		<div class="value">
			<editable-span text:bind="value" tabindex="0" />
		</div>
	`
});

export { Component, DefineList, DefineMap, stache, key, Reflect };
