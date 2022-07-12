export function emit(instance, event, ...args) {

  const { props } = instance
  // TPP思想
  // add => Add
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase()+str.slice(1)
  }
  const toHandlerKey = (str: string) => {
    return str ? "on"+capitalize(event) : ""
  }
  const handlerName = toHandlerKey(event)
  const handler = props[handlerName]
  handler && handler(...args)
  
}