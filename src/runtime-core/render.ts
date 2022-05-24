import { isObject } from './../shared/idnex';
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode,container) {
    // patch
    patch(vnode,container);
}
function patch(vnode,container){
// 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
    // console.log('vnode.type',vnode.type);
    if(typeof vnode.type === "string"){
        processElement(vnode,container);
    } else if(isObject(vnode.type)){
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
    const { children } = vnode;

    if(typeof children === "string"){
        el.textContent = children;
    } else if(Array.isArray(children)){
        // vnode
        mountChildren(vnode,el);
    }
    // el.textContent = children;
    // el.textContent = children;
    // props 
    const { props } = vnode
    for(const key in props){
        const val = props[key];
        el.setAttribute(key,val);
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

