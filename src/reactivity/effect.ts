import { extend } from './../shared/index';
let activeEffect;
let shouldTrack;

// 面向对象的思想，抽离
class ReactiveEffect {
  private _fn: any
  scheduler: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, scheduler){
    this._fn = fn
    this.scheduler = scheduler
  }

  run(){
    if(!this.active){
      // 说明执行了stop，则不进行依赖收集
      return this._fn()
    }

    activeEffect = this
    shouldTrack = true
    const result = this._fn()
    // reset
    shouldTrack = false
    return result
  }

  stop(){
    if(this.active){
      cleanupEffect(this)
      if(this.onStop){
        this.onStop()
      }
      this.active = false
      
    }
  }
}

const cleanupEffect = (effect) => {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}
function isTracking() {
  return shouldTrack && activeEffect
}

// 全局变量map维护所有收集的依赖（大盒子），每个key用小盒子装所对应的依赖（fn）
const targetMap = new Map()
export function track(target,key) {
  if(!isTracking()) return;
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if(!depsMap){
    depsMap = new Map()
    targetMap.set(target,depsMap)
  }
  let dep = depsMap.get(key)
  if(!dep){
    dep = new Set()
    depsMap.set(key,dep)
  }

  dep.add(activeEffect)
  // 反向收集一下
  activeEffect.deps.push(dep)
}

// 依赖收集的主要目的是，当响应式对象的值发生变化时，会出发对应set钩子函数，此时会把最新的值进行赋值，但此时如effect回调中的nextAge并没有更新，所有需要重新执行一下effect, 而我们收集的依赖就是这个effect回调。

export function trigger(target,key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    if(effect.scheduler){
      effect.scheduler()
    }else{
      effect.run()
    }
  }
}

export function effect(fn, options: any= {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // Object.assign(_effect,options)
  // _effect.onStop = options.onStop
  extend(_effect,options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  // 将effect实例绑定到runner上
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}