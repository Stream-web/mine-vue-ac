export function createComponentInstance(vnode){

    const component = {
        vnode,
        type:vnode.type,
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

