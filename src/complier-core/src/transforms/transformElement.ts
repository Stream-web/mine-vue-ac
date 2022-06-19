import { createVNodeCall, NodeTypes } from "../ast";

export function transformElement(node,context){
    if(node.type === NodeTypes.ELEMENT){
        // 中间处理层
        return ()=>{
            // context.helper(CREATE_ELEMENT_VNODE);
            // tag
            // const vnodeTag = node.tag;
            const vnodeTag = `'${node.tag}'`;
    
            // props
            let vnodeProps;
            // children
            const children = node.children;
            let vnodeChildren = children[0];
    
            // const child = children[0];
            node.codegenNode = createVNodeCall(
                context,vnodeTag,
                vnodeProps,vnodeChildren
            );
            // children
    
            // context.helper(CREATE_ELEMENT_VNODE);
        }

    }
}