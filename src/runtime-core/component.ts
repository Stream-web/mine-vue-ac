import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode){

    const component = {
        vnode,
        type:vnode.type,
        setupState:{}
    };
    return component;
}
export function setupComponent(instance) {
    // to-do
    // initProps
    // initSlots
    // 创建有状态的组件
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type;
// ctx
    //     {
    //     // {_:instance},
    //     get(target,key){
    //         // setupstate
    //         const { setupState} = instance;
    //         if(key in setupState){
    //             return setupState[key];
    //         }
    //         // debugger
    //         if(key === "$el"){
    //             return instance.vnode.el;
    //         }
    //     }
    // }
    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)
    const {setup} = Component
    
    if(setup){
    // fucntion object
        const setupResult = setup();
        
        handleSetupResult(instance,setupResult);
    }
}
function handleSetupResult(instance,setupResult: any) {
    // Implent
    // TODO
    if(typeof setupResult === "object"){
        instance.setupState = setupResult;
    }

    // 保证组件有值
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    // if(Component.render){
        instance.render = Component.render;
    // }
}

