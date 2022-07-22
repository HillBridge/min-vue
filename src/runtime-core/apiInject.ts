import { getCurrentInstance } from "./component";

export function provide(key,value) {
  // set

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
    const parentProvides = currentInstance.parent.provides
    if(key in parentProvides){
      return parentProvides[key] 
    }else if(defaultVal){
      return defaultVal
    }
    
  }
}