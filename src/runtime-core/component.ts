export function createComponentInstance(vnode) {
  // 创建component实例，方便以后将一些属性放在实例上处理
  const component = {
    vnode,
    type: vnode.type,
    setupState: null,
    proxy: null
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps
  // initSlots
  
  // 处理有状态的组件(setup)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  
  instance.proxy = new Proxy({}, {
    get(target, key) {
      const { setupState } = instance
      // setupState
      if(key in setupState){
        return setupState[key]
      }
      // debugger;
      console.log("target",target)
      console.log("key",key)
      if(key === '$el'){
        return instance.vnode.el
      }
      
      
    },
  })
  const Component = instance.type
  const {setup} = Component

  if(setup){
    // function object
    const setupResult = setup()

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

