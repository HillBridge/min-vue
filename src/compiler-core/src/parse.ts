import { NodeTypes } from "./ast"
const enum TagType {
  Start,
  End
}

export function baseParse(content:string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
  
}
function createRoot(children) {
  return {
    children
  }
}

function parseChildren(context) {
  const nodes: any = []
  let node;
  if(context.source.startsWith("{{")){
    node = parseInterPolation(context)
  }else if(context.source.startsWith("<")){
    if(/[a-z]/i.test(context.source)){
      node = parseElement(context)
    }
  }
  nodes.push(node)
  return nodes
}

function parseElement(content:any) {
  const element = parseTag(content, TagType.Start)

  parseTag(content, TagType.End)

  console.log("----",content.source)

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

  const rawContent = context.source.slice(0, rawContextLength)

  const content = rawContent.trim()

  advanceBy(context, rawContextLength+closeDelimiter.length)

  console.log("content",content)

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