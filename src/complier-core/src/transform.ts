import { TO_DISPLAY_STRING } from './runtimeHelpers';
import { NodeTypes } from "./ast";

export function transform(root,options={}){

    const context = createTansformContext(root,options);
    // 1.遍历 深度优先搜索
    traverseNode(root,context);
    // 修改text content
    createRootCodegen(root);

    root.helpers = [...context.helpers.keys()]
}
function createRootCodegen(root:any) {
    // Implement
    root.codegenNode = root.children[0];
}
function createTansformContext(root: any, options: any) {
    // throw new Error("Function not implemented.");
    const context = {
        root,
        nodeTransforms:options.nodeTransforms || [],
        helpers:new Map(),
        helper(key){
            context.helpers.set(key,1);
        }
    };
    return context
}

function traverseNode(node: any,context) {
    // throw new Error("Function not implemented.");
   



    // if(node.type === NodeTypes.TEXT){
    //     node.content = node.content + "mini-vue"
    // }
    // 1.element
    const nodeTransforms = context.nodeTransforms;

    for(let i=0;i<nodeTransforms.length;i++){
        const transform = nodeTransforms[i];
        transform(node,context);
    }

    switch(node.type){
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING);
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node,context);
            break;
        default:
            break;
    }

    // traverseChildren(node,context);
}
function traverseChildren(node:any,context:any){
    const children = node.children;
    if(children){
        for(let i=0;i<children.length;i++){
            const node = children[i];
            traverseNode(node,context);
        }
    }
}


