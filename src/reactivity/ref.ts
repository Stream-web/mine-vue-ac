import { hasChanged, isObject } from './../shared/idnex';
import { isTracking, trackEffects, triggerReffects } from "./effect";
import { reactive } from './reactive';

class RefIml{
    private _value: any;
    // 
    public dep
    private _rawValue:any;
    public _v_isRef = true;
    constructor(value){
        this._rawValue = value;
        // this._value = isObject(value) ? reactive(value):value;
        this._value=convert(value)
        // 如果value是对象的话那么就要做一层处理把value->reactive
        // 1、看看value是不是对象

        this.dep = new Set();
    }
    get value(){
        trackRefValue(this);
        // trackEffects(this.dep);
        return this._value
    }
    set value(newValue){
        // 一定先去修改了value 的值
        // hasChanged
        // 对比的时候 object
        if(hasChanged(newValue,this._rawValue)) {
            this._rawValue = newValue
            // this._value =  isObject(newValue) ? reactive(newValue):newValue;
            this._value = convert(newValue)
            triggerReffects(this.dep);
        }
    }
}

function convert(value){
    return isObject(value) ? reactive(value): value
}
function trackRefValue(ref){
    if(isTracking()){
        trackEffects(ref.dep);
    }
}
export function ref(value){
    return new RefIml(value);
}
export function isRef(ref){
    return !!ref._v_isRef
}
export function unRef(ref){
    // 如果是ref对象，那么直接返回出去就行了，如果不是ref

    return isRef(ref) ? ref.value : ref;
}
export function proxyRefs(objectRefs){
    return new Proxy(objectRefs,{
        get(target,key) {
            // get -> age (ref) 那么就能给他返回.value
            return unRef(Reflect.get(target,key));
        },
        // set(target,key,value){
        //     // set -> ref .value
        //     if(isRef(target[key]) && !isRef(value)){
        //         target[key].value = value;
        //     } else {
        //         return Reflect.set(target,key,value);
        //     }
        // }
        set(target,key,value) {
            if(isRef(target[key]) && !isRef(value)){
                return target[key].value = value;
            } else {
                return Reflect.set(target,key,value);
            }           
        }
    })
}