import { Component, DefineList, DefineMap, stache, key, Reflect } from "can";

import "../editable-span/editable-span";
import "./json-tree-editor.less";

const isList = (val) => (val instanceof DefineList);
stache.addHelper("isList", isList);
stache.addHelper("isNumber", (val) => typeof val === "number");
stache.addHelper("isEven", (num) => num % 2 === 0);

const capitalize = (key) => {
	return `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
};

const getTypeName = (val) => {
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

const ParsedJSONNode = DefineMap.extend("ParsedJSONNode", {
	key: NumberOrString,
	value: NumberOrString,
	type: "string",
	path: "string",
	id: {
		identity: true,
		get() {
			return JSON.stringify(this);
		}
	}
});

const ParsedJSON = DefineList.extend("ParsedJSON", {
	"#": ParsedJSONNode
});

const parseKeyValue = (key, value, parentPath) => {
	let parsedValue;
	const path =`${parentPath ? (parentPath + ".") : ""}${key}`;

	const mightHaveChildren = Reflect.isObservableLike(value) &&
		(Reflect.isListLike(value) || Reflect.isMapLike(value));

	if (mightHaveChildren) {
		parsedValue = [];

		value.forEach((childValue, childKey) => {
			parsedValue.push(
				parseKeyValue(childKey, childValue, path)
			);
		});
	} else {
		parsedValue = value;
	}

	return {
		key,
		path,
		type: getTypeName(value),
		value: parsedValue
	};
};

export const JSONTreeEditor = Component.extend({
	tag: "json-tree-editor",

	ViewModel: {
		displayedOptions: {
			value({ listenTo, lastSet, resolve }) {
				let options = resolve( new DefineList() );

				listenTo(lastSet, resolve);

				listenTo("show-options", (ev, path) => {
					const index = options.indexOf(path);

					if (index < 0) {
						options.push(path);
					}
				});

				listenTo("hide-options", (ev, path) => {
					const index = options.indexOf(path);

					if (index >= 0) {
						options.splice(index, 1);
					}
				});
			}
		},

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

			Reflect.each(this.json, (value, key) => {
				parsed.push(
					parseKeyValue(key, value)
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

		setPathValue(path, value) {
			this.dispatch("set-json-path-value", [ path, value ]);
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
				this.dispatch("set-json-path-value", [ path + "." + key, value ]);
			};
		},

		showOptions(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("show-options", [ path ]);
		},

		hideOptions(ev, path) {
			if (ev) { ev.stopPropagation(); }
			this.dispatch("hide-options", [ path ]);
		},

		shouldShowOptions(path) {
			return this.displayedOptions.indexOf(path) >= 0;
		}
	},

	view: `
		{{< keyValueTemplate }}
			{{# unless( isNumber(key) ) }}
				<div class="key">{{key}}:&nbsp;</div>
			{{/ unless }}

			{{# is type "Object"}}
				<div>{{type}}</div>
			{{/ is }}

			{{# is type "Array"}}
				<div>{{type}}({{value.length}})</div>
			{{/ is }}

			{{# unless( isList(value) ) }}
				{{# is type "String" }}
					<div class="value string"><editable-span text:from="value" on:text="scope.vm.setPathValue(path, scope.event)" /></div>
				{{ else }}
					<div class="value"><editable-span text:from="value" on:text="scope.vm.setPathValue(path, scope.event)" /></div>
				{{ / is }}
			{{/ unless }}

			{{# if( scope.vm.shouldShowOptions(path) ) }}
				<div class="options">
					{{# if( isList(value) ) }}
					<div on:click="scope.vm.addChild(scope.event, path)">&plus;</div>
					{{/ if }}
					<div on:click="scope.vm.deletePath(scope.event, path)">&minus;</div>
				</div>
			{{/ if }}
		{{/ keyValueTemplate }}

		{{< nodeTemplate }}
			<div class="wrapper" on:click="scope.vm.toggleExpanded(scope.event, path)" on:mouseenter="scope.vm.showOptions(scope.event, path)" on:mouseleave="scope.vm.hideOptions(scope.event, path)">
				{{# if( isList(value) ) }}
					<div class="header-container">
						{{# if scope.vm.isExpanded(path) }}
							<div class="arrow-toggle down" on:click="scope.vm.toggleExpanded(scope.event, path)"></div>
						{{ else }}
							<div class="arrow-toggle right" on:click="scope.vm.toggleExpanded(scope.event, path)"></div>
						{{/ if }}

						{{> keyValueTemplate }}
					</div>
				{{ else }}
						<div class="kv-group {{# if( isEven(scope.index) ) }}even-row{{/ if }}">
							{{> keyValueTemplate }}
						</div>
				{{/ if }}

				{{# if( isList(value) ) }}
					{{# if( scope.vm.isExpanded(path) ) }}
						<div class="list-container">
							{{# each(value) }}
								{{> nodeTemplate }}
							{{/ each }}
						</div>
					{{/ if }}
				{{/ if }}

				{{# if( scope.vm.shouldDisplayKeyValueEditor(path) ) }}
					<div class="kv-group {{# if( isEven(value.length) ) }}even-row{{/ if }}">
						<key-value-editor
							setKeyValue:from="scope.vm.makeSetKeyValueForPath(path)"
						></key-value-editor>
						<div class="options">
							<div on:click="scope.vm.hideKeyValueEditor(scope.event, path)">&minus;</div>
						</div>
					</div>
				{{/ if }}
			</div>
		{{/ nodeTemplate }}	

		{{# each(parsedJSON) }}
			{{> nodeTemplate }}
		{{/ each }}
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
		<div class="value string">
			<editable-span text:bind="value" tabindex="0" />
		</div>
	`
});
