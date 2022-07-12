import { camelize, toHandlerKey } from "../shared/index"

export function emit(instance, event, ...args) {
  
  const { props } = instance
  console.log("props",props)
  // TPP思想
  // add => Add
  // add-foo => addFoo
  
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
  
}