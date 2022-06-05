import { NodeTypes } from "./ast";

export function baseParse(content: string) {
    const context = createParseContext(content);
    return createRoot(
            parseChildren(context)
    ) 
}

function parseChildren(content) {
    const nodes:any = [];
    let node;
    if(content.source.startsWith("{{")){
        node = parseInterpolation(content);
    }
    nodes.push(node);
    return nodes;
}
function parseInterpolation(context){

    // {{message}} : 取到indexOf
    // const closeIndex = context.indexOf("{{");


    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(
        closeDelimiter,
        openDelimiter.length
    );
    advanceBy(context,openDelimiter.length);
    // context.source = context.source.slice(openDelimiter.length);

    const rawContentLength = closeIndex - openDelimiter.length;


    const rawContent =  context.source.slice(0,rawContentLength);
    const content = rawContent.trim()

    // content.source = context.source.slice(rawContentLength + closeDelimiter.length);

    advanceBy(context,rawContentLength+closeDelimiter.length);


    return {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: content,
        },
    }
}
function advanceBy(context:any,length:number){
    context.source = context.source.slice(length);
}
function createRoot(children){
    return {
        children,
    }
}

function createParseContext(content: any) {
    return {
        source:content,
        content:content,
    }
}
