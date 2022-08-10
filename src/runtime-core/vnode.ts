export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")
import { ShapeFlags } from "../shared/ShapeFlags";

export function createVnode(type, props?, children?) {
  // vnode 就是描述node节点的js对象
  const vnode = {
    type,
    props,
    children,
    component: null,
    next: null,
    key: props && props.key,
    shapeFlag: getShapeFalg(type),
    el: null
  }
  if(typeof children === "string"){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  }else if(Array.isArray(children)){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}

function getShapeFalg(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.SATAEFUL_COMPONENT
}

export function createTextVnode(text: string) {
  return createVnode(Text, {}, text)
}