var stealTools = require("steal-tools");
var globalJS = require("steal-tools/lib/build/helpers/global").js;

var baseNormalize = globalJS.normalize();

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
			},
			removeDevelopmentCode: false
		}
	}
}).catch(function(e){

	setTimeout(function() {
		throw e;
	},1);

});
