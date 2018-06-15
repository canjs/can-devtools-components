
import canReflect from "can-reflect";

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