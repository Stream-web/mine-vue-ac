import { mutableHandlers, readonlyHandlers,shallowReadonlyHandlers } from './baseHandlers';
// 枚举进行优化
export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive",
    IS_READONLY = "_v_isReadonly"
}
export function reactive(raw){
    // 通过proxy进行代理操作
    // return new Proxy(raw,mutableHandlers)
    return createActiveObject(raw,mutableHandlers);
}
export function readonly(raw){
    return createActiveObject(raw,readonlyHandlers);
}
export function shallowReadonly(raw){
    return createActiveObject(raw,shallowReadonlyHandlers)
}
export function isReactive(value){
    // 转化成boolean
    return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}
function createActiveObject(raw:any,baseHandlers) {
    return new Proxy(raw,baseHandlers);
}