import { track, trigger } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get(target,key) {
      const res = Reflect.get(target,key)
      // todo 收集依赖 track
      track(target,key)
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      // todo 触发依赖
      trigger(target, key)
      return res;
    },
  })
}