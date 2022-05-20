import { mutableHandlers, readonlyHandlers } from './baseHandlers';
export function reactive(raw){
    // 通过proxy进行代理操作
    // return new Proxy(raw,mutableHandlers)
    return createActiveObject(raw,mutableHandlers);
}
export function readonly(raw){
    return createActiveObject(raw,readonlyHandlers);
}
function createActiveObject(raw:any,baseHandlers) {
    return new Proxy(raw,baseHandlers);
}