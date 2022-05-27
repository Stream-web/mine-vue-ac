import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
    // if(key === "$el"){
    //     return instance.vnode.el;
    // }
    $el: (i) => i.vnode.el,
    $slots:(i)=>i.slots,
}
export const PublicInstanceProxyHandlers = {
    get({_:instance},key){
        // setupstate
        const { setupState,props} = instance;
        if(key in setupState){
            return setupState[key];
        }
        
        if(hasOwn(setupState,key)){
            return setupState[key];
        } else if(hasOwn(props,key)){
            return props[key];
        }
        // debugger
        const publicGetter = publicPropertiesMap[key]
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}