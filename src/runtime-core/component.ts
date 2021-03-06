import { shallowReadonly } from "../reactivity/reactive";
import { proxyRefs } from "../reactivity/ref";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentslots";
// import { initSlots } from "./componentSlots";


// 创建组件实例
export function createComponentInstance(vnode,parent){
    console.log("createComponentInstance",parent);
    const component = {
        vnode,
        type:vnode.type,
        next:null,
        setupState:{},
        props:{},
        slots:{},
        provides: parent?parent.provides:{},
        parent,
        subTree:{},
        isMounted:false,
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
        instance.setupState = proxyRefs(setupResult);
    }

    // 保证组件有值
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    // if(Component.render){

    if(compiler && !Component.render){
        if(Component.template){
            Component.render = compiler(Component.template);
        }
    }
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
let compiler;
export function registerRuntimeCompiler(_compiler){
    compiler = _compiler
}
