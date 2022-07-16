import { camelize, toHandleKey } from "../shared/index";

export function emit(instance,event,...args){
    console.log("emit",event);
    const { props } = instance;
    const toHandlerName = toHandleKey(camelize(event));
    const handler = props[toHandlerName];
    // TPP行为
    handler && handler(...args); 
} 