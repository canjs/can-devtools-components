import { Component, DefineList } from "../node_modules/can-devtools-components/dist/panel.mjs";

Component.extend({
    tag: "canjs-devtools-panel",

    view: `
        {{# if(error) }}
            <h2>{{{error}}}</h2>
        {{ else }}
            <components-panel
                componentTree:from="componentTree"
            ></components-panel>
        {{/ if }}
    `,

    ViewModel: {
        connectedCallback() {
			this.componentTree = [{
				"tagName": "todo-list",
				"children": [{
					"tagName": "todo-item",
					"children": []
				},{
					"tagName": "todo-editor",
					"children": []
				},{
					"tagName": "todo-item",
					"children": []
				}]
			}];
        },
        componentTree: { Type: DefineList, Default: DefineList },
        error: "string"
    }
