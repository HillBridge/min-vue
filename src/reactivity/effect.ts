// 面向对象的思想，抽离
class ReactiveEffect {
  private _fn: any
  constructor(fn){
    this._fn = fn
  }

  run(){
    activeEffect = this
    this._fn()
  }
}

// 全局变量map维护所有收集的依赖（大盒子），每个key用小盒子装所对应的依赖（fn）
const targetMap = new Map()
export function track(target,key) {
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
}

// 依赖收集的主要目的是，当响应式对象的值发生变化时，会出发对应set钩子函数，此时会把最新的值进行赋值，但此时如effect回调中的nextAge并没有更新，所有需要重新执行一下effect, 而我们收集的依赖就是这个effect回调。

export function trigger(target,key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    effect.run()
  }
}

let activeEffect;

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}