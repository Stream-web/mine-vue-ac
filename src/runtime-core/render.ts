import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from '../shared/ShapeFlags';
export function render(vnode,container) {
    // patch
    patch(vnode,container);
}
function patch(vnode,container){
// 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
    // console.log('vnode.type',vnode.type);
    const {shapeFlag} = vnode;
    if(shapeFlag & ShapeFlags.ELEMENT){
        processElement(vnode,container);
    } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        processComponent(vnode,container);
    }
    // 去处理组件
    // 判断是不是element类型
    // todo-如何区分element 和component类型
    // processElement();
    // processComponent(vnode,container)
}
// 元素
function processElement(vnode: any, container: any) {
    mountElement(vnode,container);
}

// 组件
function processComponent(vnode:any,container:any){
    mountComponent(vnode,container)
}
// mount
function mountElement(vnode: any, container: any) {
    // vnode -> element -> div
    const el = (vnode.el =document.createElement(vnode.type));
    // el.text 
    // str{ing 或者array类型
    const { children,shapeFlag } = vnode;

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        el.textContent = children;
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
        // vnode
        mountChildren(vnode,el);
    }
    // el.textContent = children;
    // el.textContent = children;
    // props 
    const { props } = vnode
    for(const key in props){
        const val = props[key];
        // 具体的click -> 通用
        // on + Evenet name
        // onMousedown 
        const isOn = (key:string) => /^on[A-Z]/.test(key)
        if(isOn(key)){
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event,val)
        } else {
            el.setAttribute(key,val);
        }
        // const val = props[key];
        // el.setAttribute(key,val);
    }
    // el.setAttribute("id","root");
    container.append(el);
    // document.body.appendChild(el);
}
function mountChildren(vnode,container){
    vnode.children.forEach((v)=>{
        patch(v,container);
    })
}
//Vnode -> initialVNode，让代码更具有可读性
function mountComponent(initialVNode: any,container) {
   const instance = createComponentInstance(initialVNode)
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode,container);
}
function setupRenderEffect(instance: any,initialVNode,container) {
    const { proxy } = instance
    // throw new Error("Function not implemented.");
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree,container)
    // element -> mount
    initialVNode.el=subTree.el
}

