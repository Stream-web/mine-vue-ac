import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment,Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options) {
    // const {
    //     createElement,
    //     // hostCreateElement,
    //     patchProp,
    //     // :
    //     // hostPatchProp,
    //     insert
    //     // :hostInsert
    // } = options
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
    } = options;
    

function render(vnode,container) {
    // patch
    patch(null,vnode,container,null);
}
// n1-> 老的
// n2 -> 新的
function patch(n1,n2,container,parentComponent){
// 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
    // console.log('vnode.type',vnode.type);
    const {type,shapeFlag} = n2;
    switch(type){
        case Fragment:
            processFragment(n1,n2,container,parentComponent);
            break;
        case Text:
            processText(n1,n2,container);
            break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(n1,n2,container,parentComponent);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(n1,n2,container,parentComponent);
            }
            break;
    }

    // 去处理组件
    // 判断是不是element类型
    // todo-如何区分element 和component类型
    // processElement();
    // processComponent(vnode,container)
}
function processText(n1,n2: any, container: any) {
    // throw new Error('Function not implemented.');
    const {children} = n2
    // children
    const textNode = (n2.el=document.createTextNode(children));
    container.append(textNode);
}
function processFragment(n1,n2, container: any,parentComponent) {
    mountChildren(n2,container,parentComponent)
}

// 元素
function processElement(n1,n2, container: any,parentComponent) {
    if(!n1){
        mountElement(n2,container,parentComponent);
    } else {
        patchElement(n1,n2,container)
    }
    
}
function patchElement(n1,n2,container){
    console.log("n1","n1");
    console.log("n2",n2);
}
// 组件
function processComponent(n1,n2:any,container:any,parentComponent){
    mountComponent(n2,container,parentComponent)
}
// mount
function mountElement(vnode: any, container: any,parentComponent) {
    // vnode -> element -> div
    // canvans : new element
    // 
    const el = (vnode.el = hostCreateElement(vnode.type));
    // el.text 
    // str{ing 或者array类型
    const { children,shapeFlag } = vnode;

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        el.textContent = children;
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
        // vnode
        mountChildren(vnode,el,parentComponent);
    }
    // el.textContent = children;
    // el.textContent = children;
    // props 
    const { props } = vnode
    for(const key in props){

        const val = props[key];
        hostPatchProp(el,key,val)
    }
    // el.setAttribute("id","root");
    // container.append(el);
    // document.body.appendChild(el);
    hostInsert(el,container)
}
function mountChildren(vnode,container,parentComponent){
    vnode.children.forEach((v)=>{
        patch(null,v,container,parentComponent);
    })
}
//Vnode -> initialVNode，让代码更具有可读性
function mountComponent(initialVNode: any,container,parentComponent) {
   const instance = createComponentInstance(initialVNode,parentComponent)
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode,container);
}
function setupRenderEffect(instance: any,initialVNode,container) {

    effect(()=>{

        if(!instance.isMounted){

        console.log('初始化')
        const { proxy } = instance
        // throw new Error("Function not implemented.");
        const subTree = (instance.subTree = instance.render.call(proxy));

        console.log("subTree",subTree);

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null,subTree,container,instance)
        // element -> mount
        initialVNode.el=subTree.el
        instance.isMounted = true

        } else {

            console.log('更新')
            const { proxy } = instance
            // throw new Error("Function not implemented.");
            const subTree = instance.render.call(proxy);
            const prevSubTree = instance.subTree
            instance.subTree = subTree
            patch(prevSubTree,subTree,container,instance)


            console.log("prevSubTree",prevSubTree)
            console.log("cur",subTree);             
        }
    });
}

    return {
        createApp: createAppAPI(render)
    }
}

