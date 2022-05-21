import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";
const set = createSetter();
const get = createGetter();
const readonlyGet = createGetter(true);
// import {}
function createGetter(isReadonly = false){
    return function get(target,key) {

        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly;
        } else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly;
        }
        const res = Reflect.get(target,key);
    
        // 依赖收集
        if(!isReadonly){
            track(target,key);
        }
        return res;
    }
}
function createSetter() {
    return function set(target,key,value) {
        const res = Reflect.set(target,key,value);
        // 触发依赖
        trigger(target,key)
        return res;
    } 
}
export const mutableHandlers = {
    get,
    set,
}
export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      console.warn(
        `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
        target
      );
  
      return true;
    },
} 