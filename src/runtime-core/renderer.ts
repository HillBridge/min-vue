import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from './vnode';

export function render(vnode, container,parentComponent) {
  // patch
  patch(vnode,container,parentComponent)
}

function patch(vnode,container,parentComponent) {
  // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
  // console.log("vnode",vnode.type)

  switch (vnode.type) {
    case Fragment:
      processFragment(vnode.children,container, parentComponent)
      break;

    case Text:
      processText(vnode,container)
      break;
  
    default:
      if(typeof vnode.type === "string"){
        processElement(vnode,container, parentComponent)
      }else if(isObject(vnode.type)){
        processComponent(vnode,container, parentComponent)
      }
      break;
  }
  
}

function processText(vnode: any, container: any) {
  // todo
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}



function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode,container, parentComponent)
}

function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode,container, parentComponent)
}


function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, children } = vnode
  // const el = document.createElement(type)
  const el = (vnode.el = document.createElement(type))
  
  if(typeof children === "string"){
    el.textContent = children
  }else if(isObject(children)){
    mountChildren(children,el, parentComponent)
  }
  for (const key in props) {
    // console.log("mountElement",key)
    const val = props[key]
    // on + 大写
    const isOn = (key) => /^on[A-Z]/.test(key)
    if(isOn(key)){
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    }else{
      el.setAttribute(key, val)
    }
    
  }
  container.append(el)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.forEach(ele => {
    patch(ele, container, parentComponent)
  });
}

function processComponent(vnode,container, parentComponent) {
  mountComponent(vnode,container, parentComponent)
}

function mountComponent(initialVNode: any, container: any, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent)
  // 处理component
  setupComponent(instance)

  // 调用render, 处理subtree
  setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect( instance, initialVNode, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  //重新调用patch
  patch(subTree, container, instance)
  // 当所有的节点都patch完后
  initialVNode.el = subTree.el

  // console.log("subTree",subTree)
}




