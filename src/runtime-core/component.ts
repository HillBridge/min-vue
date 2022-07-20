import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode) {
  // 创建component实例，方便以后将一些属性放在实例上处理
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    proxy: null,
    props: {},
    slots: {},
    emit: () => {}
  }

  component.emit = emit.bind(null,component) as any
  return component
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)

  initSlots(instance, instance.vnode.children)
  
  // 处理有状态的组件(setup)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  
  instance.proxy = new Proxy({ _: instance}, PublicInstanceProxyHandlers)
  const Component = instance.type
  const {setup} = Component

  if(setup){
    setCurrentInstance(instance)
    // function object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }

}
function handleSetupResult(instance, setupResult: any) {
  if(typeof setupResult === "object"){
    instance.setupState = setupResult
  }
  // 处理完setup后看看组件实例上是否有render

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  if(Component.render){
    instance.render = Component.render
  }
}
let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}


function setCurrentInstance(instance) {
  currentInstance = instance
}
