import { NodeTypes } from "./ast"
const enum TagType {
  Start,
  End
}

export function baseParse(content:string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, ''))
  
}
function createRoot(children) {
  return {
    children
  }
}

function parseChildren(context, parentTag: any) {
  const nodes: any = []
  while (!isEnd(context, parentTag)) {
    let node;
    if(context.source.startsWith("{{")){
      node = parseInterPolation(context)
    }else if(context.source.startsWith("<")){
      if(/[a-z]/i.test(context.source)){
        node = parseElement(context)
      }
    }
    if(!node){
      node = parseText(context)
    }
    nodes.push(node)
   
  }
   return nodes
}

function isEnd(context, parentTag) {
  const s = context.source
  if(parentTag && s.startsWith("</"+parentTag+">")){
    return true
  }

  return !s
}

function parseText(context:any) {
  let endIndex = context.source.length
  let endToken = "{{"

  const index = context.source.indexOf(endToken)
  if(index !== -1){
    endIndex = index
  }
  const content = parseTextData(context, endIndex)
  // advanceBy(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context:any, length) {
  const content = context.source.slice(0,length)
  advanceBy(context, length)
  return content
}

function parseElement(content:any) {
  const element: any = parseTag(content, TagType.Start)

  element.children = parseChildren(content, element.tag)

  parseTag(content, TagType.End)

  return element
}

function parseTag(content:any, type: TagType) {
  //1. 解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(content.source)
  const tag = match[1]
  //2. 删除处理完成的代码
  advanceBy(content, match[0].length)
  advanceBy(content, 1)
  if(type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseInterPolation(context) {
  // {{message}}
  // 把变化点给抽离出来，方便后期处理
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter,openDelimiter.length)

  
  advanceBy(context, openDelimiter.length)

  const rawContextLength = closeIndex - openDelimiter.length

  const rawContent = parseTextData(context,rawContextLength)

  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length)

  return {
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: content
      }
    }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}
function createParserContext(content:string) {
  return {
    source: content
  }
}