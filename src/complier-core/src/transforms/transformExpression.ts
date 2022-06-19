import { NodeTypes } from "../ast"
export function transformExpression(node){

    if(node.type === NodeTypes.INTERPOLATION){

        node.content = processExpression(node.content);
    }
}
function processExpression(node:any){
    // const rawContent = node.content.content;
    // node.content.content +="_ctx." + rawContent;
    node.content = `_ctx.${node.content}`;
    return node;
}