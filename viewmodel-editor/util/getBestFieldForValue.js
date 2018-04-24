
import canReflect from "can-reflect";
import 'spectre-canjs/sp-form/sp-form';
import 'spectre-canjs/sp-form/fields/sp-text-field/sp-text-field';
import 'spectre-canjs/sp-form/fields/sp-subform-field/sp-subform-field';
import 'spectre-canjs/sp-form/fields/sp-multi-check-field/sp-multi-check-field';
import 'spectre.css/dist/spectre.css!steal-less';

export default function(key,val) {

    // list/object types
    if(typeof val !== 'string' && canReflect.isListLike(val)){
        return {
            name: key,
            editTag: 'sp-multi-check-field',
            options: val.map(item => {
                return {value: item};
            })
        };
    }
    if(canReflect.isMapLike(val)){
        return {
            name: key,
            editTag: 'sp-subform-field'
        };
    }

    
    // number types
    const numeric = parseInt(val, 10);
    if(numeric){
        console.log(numeric, val);
        return {
            textType: 'number',
            name: key
        }
    }

    return key;
}