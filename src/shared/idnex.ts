// 设置所有可以共享的模块
export const extend = Object.assign;
export const isObject = (val) =>{
    return val!==null && typeof val === "object";
}