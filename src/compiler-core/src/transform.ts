import { NodeTypes } from "./ast";

export function transform(root: any) {
  // 1. 遍历 -- 深度优先搜索
  tranverseNode(root)

  //2. 修改
}

function tranverseNode(node:any) {
  console.log(node)

  if(node.type == NodeTypes.TEXT){
    node.content = node.content + "min-vue"
  }

  const children = node.children
  if(children){
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      
      tranverseNode(node)
    }
  }
}