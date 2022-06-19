import { isString } from './../../shared/index';
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;

    genFunctionPreamble(ast,context);


    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
  
    push(`function ${functionName}(${signature}){`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
  
    return {
      code: context.code,
    };
  }
function genFunctionPreamble(ast,context){
    const { push } = context;
    const VueBinging = "Vue";
    const helpers = ["toDispalyString"];
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    if(ast.helpers.length > 0){
      push(`const { ${helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`);
    }
    push("\n");
    push("return ");
}
  function createCodegenContext(): any {
    const context = {
      code: "",
      push(source) {
        context.code += source;
      },
      helper(key){
        return `${helperMapName[key]}`;
      },
    };

    return context
  }
  
  function genNode(node: any, context) {

    switch(node.type){
      case NodeTypes.TEXT:
        genText(node,context)
        break;
      case NodeTypes.INTERPOLATION:
          genInterpolation(node,context);
          break
      case NodeTypes.SIMPLE_EXPRESSION:
        genExpression(node,context);
        break;
      case NodeTypes.ELEMENT:
        genElement(node,context);
        break;
      case NodeTypes.COMPOUND_EXPRESSION:
        genCompoundExpression(node,context)
      default:
        break;
    }
  }
  function genCompoundExpression(node: any, context: any) {
    // throw new Error("Function not implemented.");
    const { push } = context
    const children = node.children
    for(let i=0;i<children.length;i++){
      const child = children[i]
      if(isString(child)){
        push(child);
      } else {
        genNode(child,context);
      }
    }
  }
  function genElement(node:any,context:any){
    const { push,helper } = context
    // push(`${helper(CREATE_ELEMENT_VNODE)}("div")`)
    const { tag,children,props } = node;
    // const child = children[0];
    push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"),${props},`)
    // + _doDisplayString
    // (_ctx.message)`);
    // for(let i=0;i<children.length;i++){
    //   const child = children[i];
      
    //   genNode(child,context);
    // }
    // genNode(children,context);
    genNodeList(genNullable([tag,props,children]),context)
    push(")");
  }
  function genNodeList(nodes,context) {
    const { push } = context;
    for (let index = 0; index < nodes.length; index++) {
      // const element = array[index];
      const node = nodes[index];
      if(isString(node)){
        push(node);
      } else {
        genNode(node,context)
      }
      if(index<nodes.length-1){
        push(", ")
      }
    }
    // throw new Error('Function not implemented.');
  }
  
  function genNullable(args:any){
    return args.map((arg) => arg || "null");
  }
  function genExpression(node: any, context: any) {
    // throw new Error("Function not implemented.");
    const { push } = context;
    push(`${node.content}`);
  }
  function genText(node:any,context:any){
        const { push } = context;
        push(`'${node.content}'`);
  }
  function genInterpolation(node:any,context:any){
    const { push,helper } = context;
    push(`_${helper[TO_DISPLAY_STRING]}(`);
    // ${genNode(node,context)})
    genNode(node.content,context)
    push(")")
  }





