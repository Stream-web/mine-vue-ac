import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentslots";
// import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode,parent){
    console.log("createComponentInstance",parent);
    const component = {
        vnode,
        type:vnode.type,
        setupState:{},
        props:{},
        slots:{},
        provides: parent?parent.provides:{},
        parent,
        emit:()=>{}
    };
    component.emit = emit.bind(null,component) as any;
    return component;
}
export function setupComponent(instance) {
    // to-do
    initProps(instance,instance.vnode.props);
    initSlots(instance,instance.vnode.children);
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
        // currentInstance = instance;
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props),
        {
            emit:instance.emit
        });
        setCurrentInstance(null);
        
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
let currentInstance = null;
export function getCurrentInstance(){
    return currentInstance
}
// 方便维护
export function setCurrentInstance(instance){
    currentInstance = instance;
}

