import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment,Text } from './vnode';
import { createAppAPI } from './createApp';

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
    patch(vnode,container,null);
}
function patch(vnode,container,parentComponent){
// 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
    // console.log('vnode.type',vnode.type);
    const {type,shapeFlag} = vnode;
    switch(type){
        case Fragment:
            processFragment(vnode,container,parentComponent);
            break;
        case Text:
            processText(vnode,container);
            break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(vnode,container,parentComponent);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(vnode,container,parentComponent);
            }
            break;
    }

    // 去处理组件
    // 判断是不是element类型
    // todo-如何区分element 和component类型
    // processElement();
    // processComponent(vnode,container)
}
function processText(vnode: any, container: any) {
    // throw new Error('Function not implemented.');
    const {children} = vnode
    // children
    const textNode = (vnode.el=document.createTextNode(children));
    container.append(textNode);
}
function processFragment(vnode: any, container: any,parentComponent) {
    mountChildren(vnode,container,parentComponent)
}

// 元素
function processElement(vnode: any, container: any,parentComponent) {
    mountElement(vnode,container,parentComponent);
}

// 组件
function processComponent(vnode:any,container:any,parentComponent){
    mountComponent(vnode,container,parentComponent)
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
        patch(v,container,parentComponent);
    })
}
//Vnode -> initialVNode，让代码更具有可读性
function mountComponent(initialVNode: any,container,parentComponent) {
   const instance = createComponentInstance(initialVNode,parentComponent)
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode,container);
}
function setupRenderEffect(instance: any,initialVNode,container) {
    const { proxy } = instance
    // throw new Error("Function not implemented.");
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree,container,instance)
    // element -> mount
    initialVNode.el=subTree.el
}

    return {
        createApp: createAppAPI(render)
    }
}

