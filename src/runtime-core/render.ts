import { EMPTY_OBJ, isObject } from '../shared/index';
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
        remove:hostRemove,
        setElementText:hostSetElementText
    } = options;
    

function render(vnode,container) {
    // patch
    patch(null,vnode,container,null,null);
}
// n1-> 老的
// n2 -> 新的
function patch(n1,n2,container,parentComponent,anchor){
// 如果是component 那么它的type是一个object类型，如果是element类型，那么它是div
    // console.log('vnode.type',vnode.type);
    const {type,shapeFlag} = n2;
    switch(type){
        case Fragment:
            processFragment(n1,n2,container,parentComponent,anchor);
            break;
        case Text:
            processText(n1,n2,container);
            break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(n1,n2,container,parentComponent,anchor);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(n1,n2,container,parentComponent,anchor);
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
function processFragment(n1,n2, container: any,parentComponent,anchor) {
    mountChildren(n2.children,container,parentComponent,anchor)
}

// 元素
function processElement(n1,n2, container: any,parentComponent,anchor) {
    if(!n1){
        mountElement(n2,container,parentComponent,anchor);
    } else {
        patchElement(n1,n2,container,parentComponent,anchor)
    }
    
}
function patchElement(n1,n2,container,parentComponent,anchor){
    console.log("n1","n1");
    console.log("n2",n2);

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props ||  EMPTY_OBJ;

    const el = (n2.el=n1.el);

    patchChildren(n1,n2,el,parentComponent,anchor);

    patchProp(el,oldProps,newProps);

}
function patchChildren(n1,n2,container,parentComponent,anchor){
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            // 1.把老的children清空
            unmountChildren(n1.children);
            // 2.设置text
            // hostSetElementText(container,c2);
        } 
        if(c1!==c2){
            hostSetElementText(container,c2);
         }
    }else {
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
            hostSetElementText(container,"");
            mountChildren(c2,container,parentComponent,anchor)
        } else {
            patchKeydChildren(c1,c2,container,parentComponent,anchor);
        }
    }
}
function patchKeydChildren(c1,c2,container,parentComponent,parentAnchor){

    const l2 = c2.length
    let i=0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;


    function isSomeVnodeType(n1,n2){
        // type key 二者相等的话那么就相等


        return n1.type===n2.type && n1.key === n2.key;
    }
// 左侧
    while(i<=e1 && i<=e2){
        const n1 = c1[i];
        const n2 = c2[i];

        if(isSomeVnodeType(n1,n2)){
            patch(n1,n2,container,parentComponent,parentAnchor);
        } else {
            break;
        }
        i++;
    }
    // console.log(i);
    // 右侧

    while(i<=e1&&i<=e2){
        const n1=c1[e1];
        const n2=c2[e2];
        if(isSomeVnodeType(n1,n2)){
            patch(n1,n2,container,parentComponent,parentAnchor)
        }else{
            break;
        }
        e1--;
        e2--;
    }


   // 3.新的比老的多 创建
    if(i>e1){
        if(i<=e2){
            const nextPos = e2+1
            const anchor = nextPos<l2 ? c2[nextPos].el : null;
            while(i<=e2){
                patch(null,c2[i],container,parentComponent,anchor);
                i++;
            }
        }
    } else if(i>e2){
        while(i<=e1){
            hostRemove(c1[i].el)
            i++;
        }
    }else {
        // 中间对比
        let s1 = i;
        let s2 = i;
        const keyTonewIndexMaP = new Map();
        // 需要patch的点
        const toBePatched = e2 - s2 +1;
        let patched = 0;


        for(let i=s2;i<=e2;i++){
            // const prevChild = c1[i]
            const nextChild = c2[i];
            keyTonewIndexMaP.set(nextChild.key,i)
        }
        
        for(let i=s1;i<=e1;i++){
            const prevChild = c1[i];
            // let newIndex = key
            // 优化点 
            if(patched >= toBePatched){
                hostRemove(prevChild.el);
                continue;
            }
            let newIndex;
            if(prevChild.key!==null){
                newIndex = keyTonewIndexMaP.get(prevChild.key)
            } else {
                for(let j=s2;j<e2;j++){
                    if(isSomeVnodeType(prevChild,c2[j])){
                        newIndex = j; 
                        break;
                    }
                }
            }

            if(newIndex === undefined){
                hostRemove(prevChild.el);
            } else {
                patch(prevChild,c2[newIndex],container,parentComponent,null);
                patched++;
            }
        }
    }

    // 使用key的话可能会实现O(1)的时间复杂度



}
function unmountChildren(children){
    for(let i=0;i<children.length;i++){
        const el = children[i].el
        hostRemove(el)
    }
}
// 空对象
function patchProp(el,oldProps,newProps) {

    if(oldProps!==newProps){
        for(const key in newProps){
            const prevProp = oldProps[key]
            const nextProp = newProps[key]
    
            if(prevProp !== nextProp){
                hostPatchProp(el,key,prevProp,nextProp);
            }
        }
        if(oldProps!==EMPTY_OBJ){
            for(const key in oldProps){
                if(!(key in newProps)){
                    // hostPatchProp(el,key,oldProps[key],null)
                    hostPatchProp(el,key,oldProps[key],null);
                }
            }
        }
    }

}
// 组件
function processComponent(n1,n2:any,container:any,parentComponent,anchor){
    mountComponent(n2,container,parentComponent,anchor)
}
// mount
function mountElement(vnode: any, container: any,parentComponent,anchor) {
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
        mountChildren(vnode.children,el,parentComponent,anchor);
    }
    // el.textContent = children;
    // el.textContent = children;
    // props 
    const { props } = vnode
    for(const key in props){

        const val = props[key];
        hostPatchProp(el,key,null,val)
    }
    // el.setAttribute("id","root");
    // container.append(el);
    // document.body.appendChild(el);
    hostInsert(el,container,anchor)
}
function mountChildren(children,container,parentComponent,anchor){
    children.forEach((v)=>{
        patch(null,v,container,parentComponent,anchor);
    })
}
//Vnode -> initialVNode，让代码更具有可读性
function mountComponent(initialVNode: any,container,parentComponent,anchor) {
   const instance = createComponentInstance(initialVNode,parentComponent)
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode,container,anchor);
}
function setupRenderEffect(instance: any,initialVNode,container,anchor) {

    effect(()=>{

        if(!instance.isMounted){

        console.log('初始化')
        const { proxy } = instance
        // throw new Error("Function not implemented.");
        const subTree = (instance.subTree = instance.render.call(proxy));

        console.log("subTree",subTree);

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null,subTree,container,instance,anchor)
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
            patch(prevSubTree,subTree,container,instance,anchor)


            console.log("prevSubTree",prevSubTree)
            console.log("cur",subTree);             
        }
    });
}

    return {
        createApp: createAppAPI(render)
    }
}

