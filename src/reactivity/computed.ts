import { ReactiveEffect } from "./effect";

class ComputedImp{
    private _getter: any;
    private _dirty: boolean = true;
    private _value: any;
    private _effect: any;
    
    // let a:any;
    constructor(getter){
        this._getter = getter
        this._effect = new ReactiveEffect(getter,() =>{
            if(!this._dirty){
                this._dirty = true;
            }
        })
    }
    get value(){
        // 调用完一次getter,就可以把它给锁上
        // 当依赖的响应式的独享的值发生改变的时候，dirty 也会发生改变
        // effect 
        // 
        if(this._dirty){
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}
export function computed(getter){
    return new ComputedImp(getter)
}