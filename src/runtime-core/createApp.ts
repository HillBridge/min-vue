import { render } from "./renderer"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
  return {
    mount(rootContainer){
      // 1. 先把根组件转为 vnode, 后续所有的逻辑都会基于vnode进行处理
      const vnode = createVnode(rootComponent)
      // 2. 将当前的组件挂在到当前根容器上
      render(vnode,rootContainer)
    }
  }
}

