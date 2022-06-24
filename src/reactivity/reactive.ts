import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const enum reactiveFlags  {
  IS_REACTIVE = "__V_isreactive",
  IS_READONLY = "__V_isreadonly"
}


export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function isReactive(value) {
  return !!value[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[reactiveFlags.IS_READONLY]
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}