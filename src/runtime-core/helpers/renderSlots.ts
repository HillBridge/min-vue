import { createVnode } from "../vnode";

export function renderSlots(slots, name) {
  const slot = slots[name]
  if(slot){
    return createVnode("div",{}, slot)
  }
  
}