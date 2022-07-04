import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  // patch
  patch(vnode,container)
}

function patch(vnode,container) {
  // 根据type处理对应的逻辑， type为组件处理组件，type为element处理element
  // processElement()
  processComponent(vnode,container)
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

