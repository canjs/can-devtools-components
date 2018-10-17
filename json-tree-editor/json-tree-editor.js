import Component from "can-component";
import DefineList from "can-define/list/list";
import DefineMap from "can-define/map/map";
import stache from "can-stache";
import canKey from "can-key";
import canReflect from "can-reflect";

import "../editable-span/editable-span";
import "./json-tree-editor.less";

stache.addHelper("isArray", (val) => Array.isArray(val));
stache.addHelper("isNumber", (val) => typeof val === "number");

const capitalize = (key) => {
	return `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
};

const getTypeName = (val) => {
	if (canReflect.isObservableLike(val)) {
		if (canReflect.isListLike(val)) {
			return "Array";
		} else if (canReflect.isMapLike(val)) {
			return "Object";
		}
	}

	return capitalize(typeof val);
};

const parseKeyValue = (key, value, parentPath) => {
	let parsedValue;
	const path =`${parentPath ? (parentPath + ".") : ""}${key}`;

	const mightHaveChildren = canReflect.isObservableLike(value) &&
		(canReflect.isListLike(value) || canReflect.isMapLike(value));

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
					let parent = canKey.get(this.json, path);

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
			value({ listenTo, lastSet, resolve }) {
				let json = resolve( new DefineMap() );

				const resetJson = (newJson) => {
					json = resolve( new DefineMap( newJson ) );
				};

				listenTo("set-json", (ev, newJson) => resetJson(newJson));

				listenTo(lastSet, (newJson) => resetJson(newJson));

				listenTo("set-json-path-value", (ev, path, value) => {
					canKey.set(json, path, value);
				});

				listenTo("delete-json-path", (ev, path) => {
					canKey.deleteKey(this.json, path);
				});

				listenTo("add-child", (ev, path) => {
					let parent = canKey.get(json, path);

					if ( parent instanceof DefineList ) {
						parent.unshift({});
					}
				});
			}
		},

		get parsedJSON() {
			const parsed = [];

			canReflect.each(this.json, (value, key) => {
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
					let parent = canKey.get(this.json, path);

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
		{{< nodeTemplate }}
			<div {{# if( isArray(value) ) }}class="clickable" on:click="scope.vm.addChild(scope.event, path)"{{/ if }}>
				<p on:mouseenter="scope.vm.showOptions(scope.event, path)" on:mouseleave="scope.vm.hideOptions(scope.event, path)">
					{{# if( isArray(value) ) }}
						{{# if scope.vm.isExpanded(path) }}
							<span class="clickable" on:click="scope.vm.toggleExpanded(scope.event, path)">▼</span>
						{{ else }}
							<span class="clickable" on:click="scope.vm.toggleExpanded(scope.event, path)">▶</span>
						{{/ if }}
					{{/ if }}

					{{# unless( isNumber(key) ) }}
						<span class="key">{{key}}:&nbsp;</span>
					{{/ unless }}

					{{# is type "Object"}}
						<span class="type">{{type}}</span>
					{{/ is }}

					{{# is type "Array"}}
						<span class="type">{{type}}({{value.length}})</span>
					{{/ is }}

					{{# unless( isArray(value) ) }}
						<span>
						{{# is type "String" }}
							<q><span class="value string"><editable-span text:from="value" on:text="scope.vm.setPathValue(path, scope.event)" /></span></q>
						{{ else }}
							<span class="value"><editable-span text:from="value" on:text="scope.vm.setPathValue(path, scope.event)" /></span>
						{{ / is }}
						</span>
					{{/ unless }}

					{{# if( scope.vm.shouldShowOptions(path) ) }}
						<div class="options">
							{{# if( isArray(value) ) }}
							<span on:click="scope.vm.addChild(scope.event, path)">&plus;</span>
							{{/ if }}
							<span on:click="scope.vm.deletePath(scope.event, path)">&minus;</span>
						</div>
					{{/ if }}
				</p>

				{{# if( isArray(value) ) }}
					{{# if( scope.vm.isExpanded(path) ) }}
						<div class="children">
							{{# each(value) }}
								{{> nodeTemplate }}
							{{/ each }}

							{{# if( scope.vm.shouldDisplayKeyValueEditor(path) ) }}
								<key-value-editor
									setKeyValue:from="scope.vm.makeSetKeyValueForPath(path)"
								></key-value-editor>
								<div class="options">
									<span on:click="scope.vm.hideKeyValueEditor(scope.event, path)">&minus;</span>
								</div>
							{{/ if }}
						</div>
					{{/ if }}
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
		<span class="key">
			<editable-span text:bind="key" editing:raw="true" tabindex="0" />:&nbsp;
		</span>
		<q>
			<span class="value string">
				<editable-span text:bind="value" tabindex="0" />
			</span>
		</q>
	`
});
