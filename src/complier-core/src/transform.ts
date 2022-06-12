
export function transform(root,options){

    const context = createTansformContext(root,options);
    // 1.遍历 深度优先搜索
    traverseNode(root,context);
    // 修改text content

}function createTansformContext(root: any, options: any) {
    // throw new Error("Function not implemented.");
    const context = {
        root,
        nodeTransforms:options.nodeTransforms || [],
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
        transform(node);
    }

    traverseChildren(node,context);
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


