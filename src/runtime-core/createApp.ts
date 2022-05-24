import { render } from "./render";
import { createVNode } from "./vnode"

export function createApp(rootComponent){
    return {
        mount(rootContainer){
            // 先转化成vnode
            // 所有的逻辑操作都会基于虚拟节点
            const vnode = createVNode(rootComponent);

            render(vnode,rootContainer);
        }
    }
}
