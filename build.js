const stealTools = require("steal-tools");
const globalJS = require("steal-tools/lib/build/helpers/global").js;

const baseNormalize = globalJS.normalize();

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm",
		main: "can-devtools-components"
	},
	options: {
		verbose: true
	},
	outputs: {
		"components": {
			dest: globalJS.dest(__dirname+"/dist/can-devtools-components.js"),
			exports: {
				"can-namespace": "can",
			},
			format: "global",
			modules: ["can-devtools-components"],
			normalize: function(depName, depLoad, curName, curLoad, loader){
				return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
			}
		},
		"+bundled-es bindings-graph": {
			modules: ["bindings-graph/bindings-graph"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/bindings-graph.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es component-tree": {
			modules: ["component-tree/component-tree"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/component-tree.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es editable-span": {
			modules: ["editable-span/editable-span"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/editable-span.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es json-tree-editor": {
			modules: ["json-tree-editor/json-tree-editor"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/json-tree-editor.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es panel": {
			modules: ["panel/panel"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/panel.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es queues-logstack": {
			modules: ["queues-logstack/queues-logstack"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/queues-logstack.mjs"),
			removeDevelopmentCode: false
		},
		"+bundled-es viewmodel-editor": {
			modules: ["viewmodel-editor/viewmodel-editor"],
			addProcessShim: true,
			dest: globalJS.dest(__dirname + "/dist/viewmodel-editor.mjs"),
			removeDevelopmentCode: false
		}
	}
}).catch(function(e){

	setTimeout(function() {
		throw e;
	},1);

});
