import Component from "can-component";
import canReflect from "can-reflect";
import "viewmodel-editor/viewmodel-editor.less";
import guessBestFieldForValue from './util/getBestFieldForValue'
import getBestFieldForValue from "./util/getBestFieldForValue";

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
        saving: 'boolean',
		tagName: "string",
        viewModelData: "any",
        fields: {
            get(){
                const vm = this.viewModelData
                return canReflect.getOwnEnumerableKeys(vm).map((key) => {
                    const val = vm[key];
                    return getBestFieldForValue(key, val)
                });
            }
        },
        updateViewModel(args){
            canReflect.update(this.viewModelData, args[0]);
            this.saving = false;
        }
	},
    view: `
        <div class="container">
		{{#unless(tagName)}}
            <h1>Select an Element to see its ViewModel</h1>
        {{else}}
            {{#unless(viewModelData)}}
                <h1><{{tagName}}> does not have a ViewModel</h1>
            {{else}}
                <h1><{{tagName}}> ViewModel</h1>
                <sp-form object:from="viewModelData" fields:from="fields" isSaving:bind="saving" on:submit="updateViewModel(scope.arguments)"></sp-form>
            {{/unless}}
        {{/unless}}
        </div>
	`
});
