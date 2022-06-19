// 设置所有可以共享的模块
export const extend = Object.assign;
export const EMPTY_OBJ = {};
export const isObject = (val) =>{
    return val!==null && typeof val === "object";
}
export const isString = (value) => typeof value === "string";
export const hasChanged = (val,newValue)=>{
    return !Object.is(val,newValue)
}
export const hasOwn = (val,key)=> Object.prototype.hasOwnProperty.call(val,key);
export const camelize = (str:string) =>{
        return str.replace(/-(\w)/g,(_,c:string) => {
            return c ? c.toUpperCase() : "";
        })
}

const capitalize = (str:string) =>{
        return str.charAt(0).toUpperCase() + str.slice(1);
};
export const toHandleKey = (str:string) =>{
        return str ? "on" + capitalize(str) : ""; 
}