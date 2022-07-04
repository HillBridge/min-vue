import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  // patch
  patch(vnode,container)
}

function patch(vnode,container) {
  // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
  console.log("vnode",vnode.type)
  if(typeof vnode.type === "string"){
    processElement(vnode,container)
  }else if(isObject(vnode.type)){
    processComponent(vnode,container)
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode,container)
}


function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode
   const el = document.createElement(type)
  
  if(typeof children === "string"){
    el.textContent = children
  }else if(isObject(children)){
    mountChildren(children,el)
  }
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.forEach(ele => {
    patch(ele, container)
  });
}

function processComponent(vnode,container) {
  mountComponent(vnode,container)
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode)
  // 处理component
  setupComponent(instance)

  // 调用render, 处理subtree
  setupRenderEffect(instance, container)
}
function setupRenderEffect( instance, container: any) {
  const subTree = instance.render()

  //重新调用patch
  patch(subTree, container)
}




