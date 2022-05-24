const publicPropertiesMap = {
    // if(key === "$el"){
    //     return instance.vnode.el;
    // }
    $el: (i) => i.vnode.el
}
export const PublicInstanceProxyHandlers = {
    get({_:instance},key){
        // setupstate
        const { setupState} = instance;
        if(key in setupState){
            return setupState[key];
        }
        // debugger
        const publicGetter = publicPropertiesMap[key]
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}