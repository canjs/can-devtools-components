import Component from "can-component";
import canReflect from "can-reflect";
import "viewmodel-editor/viewmodel-editor.less";

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
		tagName: "string",
		viewModelData: "any",
		setKeyValue: function(key, value) {
			canReflect.setKeyValue(this.viewModelData, key, value);
		}
	},
	view: `
		{{#unless(tagName)}}
            <h1>Select an Element to see its ViewModel</h1>
        {{else}}
            {{#unless(viewModelData)}}
                <h1><{{tagName}}> does not have a ViewModel</h1>
            {{else}}
                <h1><{{tagName}}> ViewModel</h1>
                <form>
                    {{#each(viewModelData, key=key value=value)}}
                        <p>
                            {{key}}:
                            <input
                                value:from="value"
                                on:change="scope.vm.setKeyValue(key, scope.element.value)">
                        </p>
                    {{/each}}
                </form>
            {{/unless}}
        {{/unless}}
	`
});
