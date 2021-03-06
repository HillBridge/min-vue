import { getCurrentInstance } from "./component";

export function provide(key,value) {
  // set
  // provide inject是将公共的值存在组件instance上，当前组件注册存值，inject通过原型链向上查找取值
  const currentInstance: any = getCurrentInstance()
  if(currentInstance){
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    if(provides === parentProvides){
      // init
      provides = (currentInstance.provides = Object.create(parentProvides))
    }
    provides[key] = value
  }
}

export function inject(key, defaultVal) {
  const currentInstance: any = getCurrentInstance()
  if(currentInstance){
    // currentInstance.parent 是指获取父级的组件实例
    const parentProvides = currentInstance.parent.provides
    if(key in parentProvides){
      return parentProvides[key] 
    }else if(defaultVal){
      return defaultVal
    }
    
  }
}