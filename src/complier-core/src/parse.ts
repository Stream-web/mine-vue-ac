import { NodeTypes } from "./ast";
const enum TagType {
    Start,
    End,
}
export function baseParse(content: string) {
    const context = createParseContext(content);
    return createRoot(
            parseChildren(context)
    ) 
}

function parseChildren(context) {
    const nodes:any = [];
    let node;
    const s = context.source
    if(s.startsWith("{{")){
        node = parseInterpolation(context);
    } else if(s[0] === "<") {
        if(/[a-z]/i.test(s[1])) {
            // console.log("parse element");
            node = parseElement(context);
        }
    }

    if(!node){
        node = parseText(context)
    }

    nodes.push(node);
    return nodes;
}
function parseText(context:any){
    
    const content = parseTextData(context,context.source.length);
    return {
        type:NodeTypes.TEXT,
        content,
    }
}
function parseTextData(context:any,length){
    // 1.获取content
    const content = context.source.slice(0,length)
    // 2.推进
    advanceBy(context,length)
    return content;
}
function parseElement(context:any){
    const element  = parseTag(context,TagType.Start);
 
 
    parseTag(context,TagType.End);

    console.log("___________",context.source);

    return element
}
function parseTag(context:any,type:TagType){
    // 1 解析Tag
    // 2 删除处理完成的代码
    const match:any = /^<\/?([a-z]+)/i.exec(context.source)
    console.log(match)
    const tag = match[1];
    advanceBy(context,match[0].length)
    advanceBy(context,1)
    console.log(context.source)
    if(type === TagType.End)
    return {
        type:NodeTypes.ELEMENT,
        tag
    }
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


    // const rawContent =  context.source.slice(0,rawContentLength);
        const rawContent = parseTextData(context,rawContentLength);

    const content = rawContent.trim()

    // content.source = context.source.slice(rawContentLength + closeDelimiter.length);

    advanceBy(context,closeDelimiter.length);


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
