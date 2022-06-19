import { NodeTypes } from "./ast";
const enum TagType {
    Start,
    End,
}
export function baseParse(content: string) {
    const context = createParseContext(content);
    return createRoot(
            parseChildren(context,[])
    ) 
}

function parseChildren(context,ancestors) {
    const nodes:any = [];
    while(!isEnd(context,ancestors)){
    let node;
    const s = context.source
    if(s.startsWith("{{")){
        node = parseInterpolation(context);
    } else if(s[0] === "<") {
        if(/[a-z]/i.test(s[1])) {
            // console.log("parse element");
            node = parseElement(context,ancestors);
        }
    }

    if(!node){
        node = parseText(context)
    }

    nodes.push(node);
}
    return nodes;
}
function isEnd(context,ancestors){
    // 2.当遇到结束标签的时候
    const s = context.source;
    // if(parentTag && s.startsWith(`</${parentTag}>`)){
    //     return true;
    // }
    if(s.startsWith("</")){
        for(let i=ancestors.length-1;i>=0;i--){
            const tag = ancestors[i].tag;
            if(startsWithEndTagOpen(s,tag)){
                return true;
            }
        }
    }
    // 1.source有值的时候
    return !s;
}
function parseText(context:any){
    
    let endIndex = context.source.length;
    let endToekns  = ["<","{{"];

    for(let i=0;i<endToekns.length;i++){
        const index = context.source.indexOf(endToekns[i]);
        if(index!==-1 && endIndex > index){
            endIndex = index;
        }
    }

    // 获取content
    const content = parseTextData(context,endIndex);

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
function parseElement(context:any,ancestors){
    // const element:any  = parseTag(context,TagType.Start);
    const element: any = parseTag(context, TagType.Start);
    ancestors.push(element)
    element.children = parseChildren(context,ancestors)
    ancestors.pop();
    console.log("-----------------");
    console.log(element.tag);
    console.log(context.source);
    console.log(context.source);
    
    
    
    // context.source.slice(2,2+element.tag.length) === element.tag
    if(startsWithEndTagOpen(context.source,element.tag)) {
        parseTag(context,TagType.End);
    }else{
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    // parseTag(context,TagType.End);

    // console.log("___________",context.source);

    return element
}
function startsWithEndTagOpen(source,tag){
    return  source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function parseTag(context:any,type:TagType){
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
  
    if (type === TagType.End) return;
  
    return {
      type: NodeTypes.ELEMENT,
      tag,
    };
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
        type:NodeTypes.ROOT
    }
}

function createParseContext(content: any) {
    return {
        source:content,
        content:content,
    }
}
