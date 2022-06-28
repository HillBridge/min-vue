import { isObject } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

// key => dep 一个key对应一个dep
// 因为过来的是一个值 1 "" true，所以无法用proxy做代理进行拦截，所以可以新建一个对象，通过get set 存取器进行依赖收集. 而ref也可以传递object, 所以我们可以对于为对象的类型进行reactive包裹处理

class refImpl{
  private _value: any;
  private _dep: Set<unknown>;
  private _rawValue: any;
  constructor(value){
    this._rawValue = value
    this._value = convert(value)
    this._dep = new Set()
  }
  get value(){
    // 收集依赖
    if(isTracking()){
      trackEffects(this._dep)
    } 
    
    return this._value
  }

  set value(newValue){
    if(Object.is(this._rawValue,newValue))return;
    this._rawValue = newValue
    this._value = convert(newValue)
    // 触发依赖
    triggerEffects(this._dep)
  }
}
function convert(value) {
  return isObject(value) ? reactive(value): value
}

export function ref(value) {
  return new refImpl(value)
}