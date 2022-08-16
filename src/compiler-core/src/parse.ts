import { NodeTypes } from "./ast"

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
  }
  nodes.push(node)
  return nodes
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