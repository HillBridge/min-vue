export function createVnode(type, props?, children?) {
  // vnode 就是描述node节点的js对象
  const vnode = {
    type,
    props,
    children
  }
  return vnode
}