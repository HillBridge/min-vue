

export function transform(root: any, options) {
  const context = createTransfromContext(root, options)
  // 1. 遍历 -- 深度优先搜索
  tranverseNode(root, context)
  //2. 修改
}

function createTransfromContext(root, options) {
  const context =  {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
  return context
}

function tranverseNode(node:any, context) {

  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node)
  }

  tranverseChildren(node, context)
}

function tranverseChildren(node, context) {
  const children = node.children
  if(children){
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      tranverseNode(node, context)
    }
  }
}