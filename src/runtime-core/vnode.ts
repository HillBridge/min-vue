export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export function createVnode(type, props?, children?) {
  // vnode 就是描述node节点的js对象
  const vnode = {
    type,
    props,
    children,
    el: null
  }
  return vnode
}

export function createTextVnode(text: string) {
  return createVnode(Text, {}, text)
}