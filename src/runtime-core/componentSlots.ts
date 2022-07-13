
export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children: [children]
  normalizeObjectSlots(instance, children)
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value: [value]
}

function normalizeObjectSlots(instance, children) {
  const slots = {}
  for (const key in children) {
    const value = children[key]
    slots[key] = normalizeSlotValue(value)
  }
  instance.slots = slots
}