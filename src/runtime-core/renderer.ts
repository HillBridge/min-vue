import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  // patch
  patch(vnode,container)
}

function patch(vnode,container) {
  // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
  // console.log("vnode",vnode.type)

  switch (vnode.type) {
    case "Fragment":
      processFragment(vnode.children,container)
      break;
  
    default:
      if(typeof vnode.type === "string"){
        processElement(vnode,container)
      }else if(isObject(vnode.type)){
        processComponent(vnode,container)
      }
      break;
  }
  
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode,container)
}

function processElement(vnode: any, container: any) {
  mountElement(vnode,container)
}


function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode
  // const el = document.createElement(type)
  const el = (vnode.el = document.createElement(type))
  
  if(typeof children === "string"){
    el.textContent = children
  }else if(isObject(children)){
    mountChildren(children,el)
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

function mountChildren(vnode, container) {
  vnode.forEach(ele => {
    patch(ele, container)
  });
}

function processComponent(vnode,container) {
  mountComponent(vnode,container)
}

function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode)
  // 处理component
  setupComponent(instance)

  // 调用render, 处理subtree
  setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect( instance, initialVNode, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  //重新调用patch
  patch(subTree, container)
  // 当所有的节点都patch完后
  initialVNode.el = subTree.el

  // console.log("subTree",subTree)
}




