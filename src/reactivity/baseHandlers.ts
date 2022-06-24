import { track, trigger } from "./effect";
import { reactiveFlags } from "./reactive";
const get = createGetter()
const readonlyGet = createGetter(true)


function createGetter(isReadolny=false) {
  return function get(target,key) {
    const res = Reflect.get(target,key)
    if(key === reactiveFlags.IS_REACTIVE){
      return !isReadolny
    }
    if(key === reactiveFlags.IS_READONLY){
      return isReadolny
    }
    if(!isReadolny){
       track(target,key)
    }
    return res;
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // todo 触发依赖
    trigger(target, key)
    return res;
  }
}

export const mutableHandlers = {
  get,
  set: createSetter(),
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key:${key} set failed, because target is readonly`, target)
    return true
  }
}

